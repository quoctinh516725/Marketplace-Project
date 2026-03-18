import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import paymentRepository from "../../repositories/payment.repository";
import { sortParams } from "../../utils/sortParams";
import crypto from "crypto";
import qs from "qs";
import { NotFoundError, ValidationError } from "../../error/AppError";
import { OrderStatus } from "../../constants/orderStatus";
import { PaymentMethod } from "../../constants/payment/paymentMethod";
import { PaymentStatus } from "../../constants/payment/paymentStatus";
import { paymentQueue } from "../../queues/payment.queue";
import { formatDate } from "../../utils/format";
import orderRepository from "../../repositories/order.repository";
import inventoryService from "../inventory/inventory.service";
import { emailQueue } from "../../queues/email.queue";
import notificationService from "../notification/notification.service";
import idempotencyKeyRepository from "../../repositories/idempotencyKey.repository";
import { IdempotencyKeyStatus } from "../../constants/idempotencyKeyStatus";
import { CacheKey } from "../../cache/cache.key";
import { deleteLock } from "../../middlewares/idempotency.middleware";
import cacheService from "../../cache/cache.service";

type GetPaymentReturn = {
  paymentId: string;
  responseCode: string;
  transactionStatus: string;
  message: string;
};

class PaymentService {
  verifySecureHash = (vnp_Params: any) => {
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    // sort params
    const sortedParams = sortParams(vnp_Params);

    const signData = qs.stringify(sortedParams, { encode: false });

    const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET!);

    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // verify chữ ký
    if (secureHash !== signed) {
      throw new ValidationError("Sai chữ ký VNPay");
    }
  };

  handlePaymentSuccess = async (paymentId: string, transactionId: string) => {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await paymentRepository.findById(tx, paymentId);

      if (!payment) {
        throw new NotFoundError("Không tìm thấy giao dịch");
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        return payment;
      }

      // Update Payment Status
      const updatedPayment = await paymentRepository.update(tx, payment.id, {
        status: PaymentStatus.SUCCESS,
        transactionId,
        paidAt: new Date(),
      });

      // Update  MasterOrder Status
      await orderRepository.updateOrder(tx, payment.masterOrderId, {
        status: OrderStatus.PAID,
      });

      const subTotalIds = payment.allocations.map((a) => a.subOrderId);

      // Update SubOrder Status
      await orderRepository.updateSubOrders(tx, subTotalIds, {
        status: OrderStatus.PAID,
      });

      // Query Item
      const items = await orderRepository.findOrderItemBySubOrderIds(
        tx,
        subTotalIds,
      );

      // Decrease stock
      await inventoryService.decrementStock(
        tx,
        items.map((i) => ({ quantity: i.quantity, variantId: i.variantId })),
      );

      // Send Notification
      await notificationService.createNotification(
        payment.userId,
        "Thanh toán thành công",
        `Giao dịch thanh toán với mã ${payment.id} đã được thanh toán thành công!`,
      );

      return updatedPayment;
    });

    // Send Email
    await emailQueue.add(
      "PAYMENT_SUCCESS",
      {
        orderId: result.masterOrderId,
        userId: result.userId,
      },
      { removeOnComplete: true, removeOnFail: true },
    );

    return result;
  };

  handlePaymentFailed = async (paymentId: string, transactionId: string) => {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await paymentRepository.findById(tx, paymentId);

      if (!payment) {
        throw new NotFoundError("Không tìm thấy giao dịch");
      }

      // Update Payment Status
      const updatedPayment = await paymentRepository.update(tx, payment.id, {
        status: PaymentStatus.FAILED,
        transactionId,
        paidAt: new Date(),
      });

      // Send Notification
      await notificationService.createNotification(
        payment.userId,
        "Thanh toán thất bại",
        `Giao dịch thanh toán với mã ${payment.id} đã thất bại!`,
      );

      return updatedPayment;
    });

    return result;
  };

  generatePaymentUrl = (
    paymentId: string,
    amount: number,
    ipAddress: string,
  ): string => {
    const vnp_TmnCode = env.VNP_TMNCODE;
    const vnp_ReturnUrl = env.VNP_RETURN_URL;
    const vnp_HashSecret = env.VNP_HASHSECRET;
    const vnp_Url = env.VNP_URL;

    const now = new Date();
    const expire = new Date(now.getTime() + 15 * 60 * 1000);

    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount: amount * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: paymentId,
      vnp_OrderInfo: `Mã thanh toán của đơn hàng ${paymentId}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: formatDate(now),
      vnp_ExpireDate: formatDate(expire),
    };

    // Sort Params
    const paramsSorted = sortParams(vnp_Params);

    // Chuyển Object -> QueryString
    const queryStrings = qs.stringify(paramsSorted, { encode: false });

    // Hash dữ liệu
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);

    // Signed Data
    const signed = hmac.update(queryStrings).digest("hex");

    return `${vnp_Url}?${queryStrings}&vnp_SecureHash=${signed}`;
  };

  getPaymentReturn = async (vnp_Params: any): Promise<GetPaymentReturn> => {
    // Verify vnp_SecureHash
    this.verifySecureHash(vnp_Params);

    const paymentId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const transactionStatus = vnp_Params["vnp_TransactionStatus"];

    const payment = await paymentRepository.findById(prisma, paymentId);

    if (!payment) {
      throw new NotFoundError("Không tìm thấy giao dịch");
    }
    let message = "Thanh toán thất bại";

    if (responseCode === "00" && transactionStatus === "00") {
      message = "Thanh toán thành công";
    }

    return {
      paymentId: payment.id,
      responseCode,
      transactionStatus,
      message,
    };
  };

  vnpayIPN = async (vnp_Params: any) => {
    // Verify vnp_SecureHash
    this.verifySecureHash(vnp_Params);

    const paymentId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const transactionStatus = vnp_Params["vnp_TransactionStatus"];
    const transactionNo = vnp_Params["vnp_TransactionNo"];

    const payment = await paymentRepository.findById(prisma, paymentId);

    if (!payment) {
      throw new NotFoundError("Không tìm thấy giao dịch");
    }
    if (
      payment.status === PaymentStatus.SUCCESS ||
      payment.status === PaymentStatus.FAILED
    ) {
      return;
    }

    if (responseCode === "00" && transactionStatus === "00") {
      await this.handlePaymentSuccess(paymentId, transactionNo);
    } else {
      await this.handlePaymentFailed(paymentId, transactionNo);
    }
  };

  getPaymentUrl = async (
    orderId: string,
    userId: string,
    ipAddress: string,
    idempotency: {
      key: string;
      lockValue: string;
      lockKey: string;
      requestHash: string;
    },
  ) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Lock row for update để tránh tạo trùng
        await tx.$executeRaw`
            SELECT id FROM "MasterOrder"
            WHERE id = ${orderId}
            FOR UPDATE
        `;

        const order = await orderRepository.findById(
          tx,
          orderId as string,
          userId,
        );
        if (!order) throw new NotFoundError("Không tìm thấy đơn hàng!");

        // Order Expire
        if (order.status !== OrderStatus.PENDING_PAYMENT) {
          throw new ValidationError(
            "Đơn hàng không ở trạng thái chờ thanh toán!",
          );
        }

        let payment = await paymentRepository.findLastPaymentByOrderId(
          tx,
          order.id,
          userId,
        );
        if (!payment) throw new NotFoundError("Không tìm thấy giao dịch!");

        // Cod
        if (payment.paymentMethod === PaymentMethod.COD) {
          throw new ValidationError("Phương thức thanh toán không hợp lệ!");
        }

        // payment SUCCESS
        if (payment.status === PaymentStatus.SUCCESS) {
          throw new ValidationError("Giao dịch đã thanh toán!");
        }

        // payment FAILED hoặc EXPIRED tạo payment mới với order trên
        if (
          payment.status === PaymentStatus.FAILED ||
          payment.status === PaymentStatus.EXPIRED
        ) {
          const newPayment = await paymentRepository.createPayment(tx, {
            masterOrderId: payment.masterOrderId,
            paymentMethod: payment.paymentMethod,
            totalAmount: payment.totalAmount.toNumber(),
            userId,
          });

          await paymentRepository.createPaymentAllocations(
            tx,
            payment.allocations.map((alloc) => ({
              paymentId: newPayment.id,
              subOrderId: alloc.subOrderId,
              amount: alloc.amount,
            })),
          );

          await orderRepository.updateSubOrders(
            tx,
            payment.allocations.map((a) => a.subOrderId),
            { currentPaymentId: newPayment.id },
          );

          payment = newPayment;
        }

        return payment;
      });

      // Sync Payment
      await paymentQueue.add(
        "expire-payment",
        { paymentId: result.id },
        { delay: 15 * 60 * 1000, removeOnComplete: true, removeOnFail: true },
      );

      // payment hợp lệ
      const paymentUrl = this.generatePaymentUrl(
        result.id,
        result.totalAmount.toNumber(),
        ipAddress,
      );

      const responseWrapper = {
        requestHash: idempotency.requestHash,
        data: paymentUrl,
      };
      await idempotencyKeyRepository.update(idempotency.key, userId, {
        status: IdempotencyKeyStatus.SUCCESS,
        response: JSON.stringify(responseWrapper),
      });

      await cacheService.set(
        CacheKey.idempotency.key(idempotency.key, userId),
        responseWrapper,
        10 * 60,
      );

      return paymentUrl;
    } catch (error) {
      await idempotencyKeyRepository.updateStatus(
        idempotency.key,
        userId,
        IdempotencyKeyStatus.FAILED,
      );
      throw error;
    } finally {
      await deleteLock(idempotency.lockKey, idempotency.lockValue);
    }
  };
}

export default new PaymentService();
