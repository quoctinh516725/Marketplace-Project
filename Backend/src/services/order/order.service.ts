import { OrderResponseDto } from "../../dtos/order/order.response.dto";
import { OrderRequestDto } from "../../dtos/order";
import userRepository from "../../repositories/user.repository";
import { prisma } from "../../config/prisma";
import { UserStatus } from "../../constants";
import { NotFoundError, ValidationError } from "../../error/AppError";
import cartService from "../cart/cart.service";
import { randomInt } from "node:crypto";
import productRepository from "../../repositories/product.repository";
import inventoryService from "../inventory/inventory.service";
import orderRepository from "../../repositories/order.repository";
import { VoucherResponseDto } from "../../dtos";
import adminService from "../admin/admin.service";
import { System } from "../../constants/system/systemKey";
import { DEFAULT_COMMISSION_RATE_VALUE } from "../../constants/system/systemValue";
import ghnService from "../shipping/ghn.service";
import paymentRepository from "../../repositories/payment.repository";
import { paymentQueue } from "../../queues/payment.queue";
import { orderQueue } from "../../queues/order.queue";
import { PaymentStatus } from "../../constants/payment/paymentStatus";
import paymentService from "../payment/payment.service";
import { PaymentMethod } from "../../constants/payment/paymentMethod";
import { InputAll, PrismaType } from "../../types";
import { emailQueue } from "../../queues/email.queue";
import { OrderStatus } from "../../constants/orderStatus";
import { RefundStatus } from "../../constants/refundStatus";
import refundRepository from "../../repositories/refund.repository";
import shopRepository from "../../repositories/shop.repository";
import { ShopStatus } from "../../constants/shopStatus";
import notificationService from "../notification/notification.service";
import voucherService from "../voucher/voucher.service";
import { ProductVariantResult } from "../../types/product.type";
import idempotencyKeyRepository from "../../repositories/idempotencyKey.repository";
import { IdempotencyKeyStatus } from "../../constants/idempotencyKeyStatus";
import redis from "../../config/redis";
import { CacheKey } from "../../cache/cache.key";
import { deleteLock } from "../../middlewares/idempotency.middleware";
import cacheService from "../../cache/cache.service";

type VariantItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  stock: number;
  quantity: number;
  weight: number;
  imageUrl?: string;
};

type ShopInfo = {
  id: string;
  commissionRate: number | undefined;
  districtId: number;
  provinceId: number;
  wardCode: string;
};

type ShopGroup = {
  shop: ShopInfo;
  items: VariantItem[];
  itemsTotal: number;
  weightedTotal: number;
  shippingFee: number;
  voucher?: {
    discountAmount: number;
    voucherData: VoucherResponseDto;
  };
};

class OrderService {
  private generateOrderCode = (prefix: string): string => {
    const timestamp = Date.now().toString().slice(-8);
    const random = randomInt(1000, 9999).toString();
    return `${prefix}-${timestamp}-${random}`;
  };

  private enrichedShopItems = async (
    userId: string,
    variants: ProductVariantResult[],
    data: OrderRequestDto,
  ): Promise<Map<string, ShopGroup>> => {
    // Map đầy đủ thông tin trong cơ sở dữ liệu của những item người dùng muốn mua
    // Mục đích để enriched nhanh hơn thanh vì find trong variants mỗi lần map qua item
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Dựa vào variantMap để enriched thêm những thông tin cần thiết cho việc tạo đơn hàng
    // Sau bước này chúng ta sẽ có đầy đủ thông tin của những item người dùng muốn mua dựa vào variantId
    const enrichedItems = data.items.map((v) => {
      const variant = variantMap.get(v.variantId);
      if (!variant) {
        throw new ValidationError("Biến thể không hợp lệ");
      }

      // check soft-delete flags
      if (variant.deletedAt !== null) {
        throw new ValidationError("Biến thể không tồn tại hoặc đã bị xóa");
      }

      if (!variant.product || variant.product.deletedAt !== null) {
        throw new ValidationError("Sản phẩm không tồn tại hoặc đã bị xóa");
      }

      return {
        variantId: variant.id,
        productId: variant.product.id,
        productName: variant.product.name,
        variantName: variant.variantName,
        price: variant.price.toNumber(),
        stock: variant.stock,
        quantity: v.quantity,
        weight: variant.weight,
        imageUrl: variant.imageUrl || variant.product.thumbnailUrl,
        shop: {
          id: variant.product.shop.id,
          commissionRate: variant.product.shop.commissionRate?.toNumber(),
          districtId: variant.product.shop.districtId,
          provinceId: variant.product.shop.provinceId,
          wardCode: variant.product.shop.wardCode,
        },
      };
    });

    // Group Shop group để tính toán phí vận chuyển và thông tin đơn hàng không cần query lại nhiều lần
    const shopGroup = new Map<string, ShopGroup>();

    enrichedItems.forEach((item) => {
      const shopId = item.shop.id;

      if (!shopGroup.has(shopId)) {
        shopGroup.set(shopId, {
          shop: item.shop,
          items: [],
          itemsTotal: 0,
          weightedTotal: 0,
          shippingFee: 0,
        });
      }
      const shop = shopGroup.get(shopId)!;
      shop.items.push(item);
      shop.itemsTotal += item.price * item.quantity;
      shop.weightedTotal += item.weight * item.quantity;
    });

    // Validate Shop Voucher nếu có và gán voucher đã validate vào từng item để tính toán giảm giá sau này
    if (data.vouchers?.shop) {
      const voucherInputs = data.vouchers.shop.map((v) => {
        const data = shopGroup.get(v.shopId);
        if (!data)
          throw new NotFoundError(
            `Mã giảm giá ${v.code} không thuộc bất kì sản phẩm nào được mua. Vui lòng kiểm tra lại! `,
          );
        return {
          shopId: v.shopId,
          code: v.code,
          shopOrderTotal: data.itemsTotal,
        };
      });

      const results = await voucherService.validationShopVoucher(
        prisma,
        userId,
        voucherInputs,
      );

      results.forEach((i) => {
        const shopData = shopGroup.get(i.shopId);
        if (shopData) {
          shopData.voucher = {
            discountAmount: i.discountAmount,
            voucherData: i.voucher,
          };
        }
      });
    }

    await Promise.all(
      [...shopGroup.entries()].map(async ([shopId, group]) => {
        // Caculate Shiping Fee

        const shippingFee = await ghnService.calculateFee({
          fromDistrictId: group.shop.districtId,
          fromWardCode: group.shop.wardCode,
          toDistrictId: data.districtId,
          toWardCode: data.wardCode,
          weight: group.weightedTotal * 1000, // GHN tính theo gram nên nhân cho 1000
          totalAmount: group.itemsTotal,
        });

        group.shippingFee = shippingFee;
      }),
    );

    return shopGroup;
  };

  private calculateSumItems = (items: VariantItem[]): number => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  };

  createOrder = async (
    userId: string,
    data: OrderRequestDto,
    ipAddr: string,
    idempotency: {
      key: string;
      lockValue: string;
      lockKey: string;
      requestHash: string;
    },
  ): Promise<OrderResponseDto> => {
    const user = await userRepository.findBasicById(prisma, userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundError("Người dùng không tồn tại hoặc không hoạt động!");
    }

    const selectedVariantIds = [...new Set(data.items.map((i) => i.variantId))];

    const variants =
      await productRepository.getProductVariantByIds(selectedVariantIds);

    // Enriched data for order items
    const shopGroup = await this.enrichedShopItems(userId, variants, data);

    const enrichedItems = Array.from(shopGroup.values()).flatMap(
      (g) => g.items,
    );

    // Generate Master Order
    const masterOrderCode = this.generateOrderCode("ORD");

    // Caculation Original Total to validation Vocher
    const masterOriginalTotal = this.calculateSumItems(enrichedItems);

    // Validate Platform Voucher if provided and caculate discount
    let totalPlatformDiscount = 0;
    let platformVoucher: VoucherResponseDto;

    if (data.vouchers?.platform) {
      const result = await voucherService.validationPlatformVoucher(
        prisma,
        userId,
        { code: data.vouchers.platform.code, orderTotal: masterOriginalTotal },
      );

      totalPlatformDiscount = result.discountAmount;
      platformVoucher = result.voucher;
    }

    // Get Default CommissionRate
    const defaultCommissionRate = parseFloat(
      await adminService.getSetting(
        System.DEFAULT_COMMISSION_RATE,
        DEFAULT_COMMISSION_RATE_VALUE.toString(),
      ),
    );

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Lock Stock Update Atomic
        const lockItems = enrichedItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }));

        await inventoryService.lockStock(tx, lockItems);

        // Lock Usage Voucher Atomic
        const usageVouchers = [
          ...(platformVoucher?.id ? [platformVoucher.id] : []),
          ...Array.from(shopGroup.values()).flatMap((g) =>
            g.voucher ? [g.voucher.voucherData.id] : [],
          ),
        ];

        const lockVocherDatas = usageVouchers.map((v) => ({
          voucherId: v,
          userId,
          usedAt: new Date(),
        }));

        if (usageVouchers.length > 0) {
          await voucherService.applyVoucher(tx, lockVocherDatas);
        }

        // Create MasterOrder
        const masterOrder = await orderRepository.createOrder(tx, {
          userId,
          orderCode: masterOrderCode,
          itemsTotal: masterOriginalTotal,
          shippingTotal: 0,
          originalTotalAmount: 0,
          platformDiscount: totalPlatformDiscount,
          receiverAddress: data.receiverAddress,
          receiverName: data.receiverName,
          receiverPhone: data.receiverPhone,
        });

        // Create SubOrder

        let originalTotalAmount = 0;
        let shippingTotal = 0;
        let totalMasterOrder = 0;

        const subOrders = [];
        for (const [shopId, group] of shopGroup) {
          const { shop, items, shippingFee, voucher } = group;
          // Generate SubOrder
          const subOrderCode = this.generateOrderCode("SUB");

          // Caculate totalAmout
          const itemsTotal = group.itemsTotal;

          // Caculate Shop Vocher Discount
          const totalShopDiscount = voucher?.discountAmount ?? 0;

          // Caculate Platform Discount Share
          const totalPlatformDiscountShare =
            (itemsTotal / masterOriginalTotal) * totalPlatformDiscount;

          const totalDiscountSubOrder =
            totalShopDiscount + totalPlatformDiscountShare;

          // Caculate Commission Amount
          const totalAmountAfterDiscountSubOrder =
            itemsTotal - totalDiscountSubOrder;

          const commissionAmount =
            totalAmountAfterDiscountSubOrder *
            (shop.commissionRate ?? defaultCommissionRate);

          // Caculate Real Amount Shop get
          const realAmountShopGet =
            totalAmountAfterDiscountSubOrder + shippingFee - commissionAmount;

          // Caculate Real Amount User pay
          const totalAmountUserPay =
            totalAmountAfterDiscountSubOrder + shippingFee;

          const subOrderData = await orderRepository.createSubOrder(tx, {
            masterOrderId: masterOrder.id,
            shopId,
            itemsTotal,
            shippingFee,
            discountAmount: totalDiscountSubOrder,
            commissionAmount,
            realAmount: realAmountShopGet,
            totalAmount: totalAmountUserPay,
            subOrderCode,
            orderItems: {
              createMany: {
                data: items.map((i) => ({
                  productId: i.productId,
                  variantId: i.variantId,
                  productName: i.productName,
                  variantName: i.variantName,
                  quantity: i.quantity,
                  price: i.price,
                  totalPrice: Number(i.price) * i.quantity,
                  imageUrl: i.imageUrl,
                })),
              },
            },
          });

          totalMasterOrder += totalAmountUserPay;
          originalTotalAmount += itemsTotal + shippingFee;
          shippingTotal += shippingFee;
          subOrders.push(subOrderData);
        }

        // Create Payment
        const payment = await paymentRepository.createPayment(tx, {
          masterOrderId: masterOrder.id,
          paymentMethod: data.paymentMethod,
          totalAmount: totalMasterOrder,
          userId,
        });

        //Create Payment Allocation
        await paymentRepository.createPaymentAllocations(
          tx,
          subOrders.map((order) => ({
            paymentId: payment.id,
            subOrderId: order.id,
            amount: order.totalAmount,
          })),
        );

        // Update currentPaymentId for SubOrder
        await orderRepository.updateSubOrders(
          tx,
          subOrders.map((o) => o.id),
          { currentPaymentId: payment.id },
        );

        // Update Master Order
        await orderRepository.updateOrder(tx, masterOrder.id, {
          shippingTotal,
          originalTotalAmount,
          totalAmountAtBuy: totalMasterOrder,
        });

        return {
          orderId: masterOrder.id,
          totalAmount: totalMasterOrder,
          paymentId: payment.id,
          paymentMethod: payment.paymentMethod,
          orderCode: masterOrderCode,
          status: payment.status as PaymentStatus,
        };
      });

      // Remove Cart
      await cartService.removeItems(
        { id: userId, type: "user" },
        enrichedItems.map((i) => i.variantId),
      );

      // Sync Payment
      await paymentQueue.add(
        "expire-payment",
        { paymentId: result.paymentId },
        { delay: 15 * 60 * 1000, removeOnComplete: true, removeOnFail: true },
      );

      // Sync Order
      await orderQueue.add(
        "expire-order",
        {
          orderId: result.orderId,
          userId,
        },
        {
          delay: 24 * 60 * 60 * 1000,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );

      // Send Email
      await emailQueue.add(
        "ORDER_CREATED",
        {
          orderId: result.orderId,
          userId,
        },
        { removeOnComplete: true, removeOnFail: true },
      );

      // Send Notification
      await notificationService.createNotification(
        userId,
        "Đơn hàng mới được tạo",
        `Đơn hàng ${result.orderCode} đã được tạo thành công. Tổng số tiền: ${result.totalAmount.toLocaleString()} VND`,
      );

      let paymentUrl: string | undefined = undefined;
      if (result.paymentMethod !== PaymentMethod.COD) {
        // Generate Payment_Url
        paymentUrl = paymentService.generatePaymentUrl(
          result.paymentId,
          result.totalAmount,
          ipAddr,
        );
      }

      const response = { ...result, paymentUrl };

      const responseWrapper = {
        requestHash: idempotency.requestHash,
        data: response,
      };
      await idempotencyKeyRepository.update(idempotency.key, userId, {
        status: IdempotencyKeyStatus.SUCCESS,
        response: JSON.stringify(responseWrapper),
      });

      await cacheService.set(
        CacheKey.idempotency.key(idempotency.key, userId),
        responseWrapper,
        10 * 60, // Cache kết quả trong 10 phút
      );

      return response;
    } catch (error) {
      await idempotencyKeyRepository.updateStatus(
        idempotency.key,
        userId,
        IdempotencyKeyStatus.FAILED,
      );
      throw error;
    } finally {
      await deleteLock(idempotency.lockKey, idempotency.lockValue); // Đảm bảo xóa lock sau khi xử lý xong
    }
  };

  getSubOrderDetail = async (subOrderId: string, userId: string) => {
    const subOrder = await orderRepository.findSubOrderById(subOrderId);

    if (!subOrder) throw new NotFoundError("Không tìm thấy đơn hàng");
    if (subOrder.masterOrder.userId !== userId) {
      throw new ValidationError("Bạn không có quyền xem đơn hàng này!");
    }
    return subOrder;
  };

  getMyOrders = async (userId: string, input: InputAll) => {
    const user = await userRepository.findBasicById(prisma, userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundError("Người dùng không tồn tại hoặc không hoạt động!");
    }

    return await orderRepository.findOrdersByUserId(userId, input);
  };

  cancelSubOrder = async (
    userId: string,
    subOrderId: string,
    reason: string,
    idempotency: {
      key: string;
      lockValue: string;
      lockKey: string;
      requestHash: string;
    },
  ) => {
    const subOrder = await orderRepository.findSubOrderById(subOrderId);
    if (!subOrder) throw new NotFoundError("Không tìm thấy đơn hàng");

    if (subOrder.masterOrder.userId !== userId) {
      throw new ValidationError("Bạn không có quyền hủy đơn hàng này!");
    }

    if (subOrder.status === OrderStatus.COMPLETED) {
      throw new ValidationError(
        "Đơn hàng đã xác nhận thành công không thể hủy được!",
      );
    }

    const allowCancelStatus: OrderStatus[] = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID,
      OrderStatus.SHIPPING,
    ];

    if (!allowCancelStatus.includes(subOrder.status as OrderStatus)) {
      throw new ValidationError(
        "Đơn hàng đang ở trạng thái không thể hủy được!",
      );
    }

    const payment = await paymentRepository.findByCurrentPaymentId(
      prisma,
      subOrder.currentPaymentId!,
    );

    if (!payment) throw new NotFoundError("Không tìm thấy giao dịch!");

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Auto cancel sub order if order status is pending payment
        if (subOrder.status === OrderStatus.PENDING_PAYMENT) {
          // Update Sub Order
          await orderRepository.cancelSubOrder(tx, [subOrder.id]);

          // Release Stock
          await inventoryService.releaseStock(
            tx,
            subOrder.orderItems.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          );

          // Send Notification
          await notificationService.createNotification(
            userId,
            "Đơn hàng đã được hủy",
            `Đơn hàng ${subOrder.subOrderCode} đã được hủy thành công!`,
          );

          return {
            message: "Yêu cầu hủy đơn đã được xử lý thành công!",
          };
        }

        // Create Refund
        const refund = await refundRepository.createRefund(tx, {
          amount: subOrder.totalAmount,
          reason,
          subOrderId: subOrder.id,
          status: RefundStatus.REQUESTED,
          paymentId: payment.id,
        });

        // Send Notification
        await notificationService.createNotification(
          userId,
          "Yêu cầu hủy đơn đã được gửi",
          `Yêu cầu hủy đơn hàng ${subOrder.subOrderCode} đã được gửi thành công và đang chờ xử lý!`,
        );

        return {
          message: "Yêu cầu hủy đơn đã được gửi thành công, đang chờ xử lý!",
          refundId: refund.id,
        };
      });

      // Sync Order
      if (result.refundId) {
        await orderQueue.add(
          "refund-sub-order",
          {
            refundId: result.refundId,
          },
          {
            delay: 24 * 60 * 60 * 1000,
            removeOnComplete: true,
            removeOnFail: true,
          },
        );
      }

      const responseWrapper = {
        requestHash: idempotency.requestHash,
        data: result,
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

      return result;
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

  getShopOrders = async (shopId: string, input: InputAll) => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop || shop.status !== ShopStatus.ACTIVE) {
      throw new NotFoundError("Shop không tồn tại hoặc không hoạt động!");
    }
    return await orderRepository.findSubOrdersByShopId(shopId, input);
  };

  updateSubOrderStatus = async (
    subOrderId: string,
    shopId: string,
    status: OrderStatus,
  ) => {
    const subOrder = await orderRepository.findSubOrderById(subOrderId);
    if (!subOrder) throw new NotFoundError("Không tìm thấy đơn hàng");

    if (subOrder.shopId !== shopId) {
      throw new ValidationError("Bạn không có quyền cập nhật đơn hàng này!");
    }

    const payment = await paymentRepository.findByCurrentPaymentId(
      prisma,
      subOrder.currentPaymentId!,
    );
    if (!payment) throw new NotFoundError("Không tìm thấy giao dịch!");

    if (
      payment.paymentMethod !== PaymentMethod.COD &&
      payment.status !== PaymentStatus.SUCCESS
    ) {
      throw new ValidationError(
        "Giao dịch chưa thanh toán không thể cập nhật trạng thái đơn hàng!",
      );
    }
    // Send Notification
    await notificationService.createNotification(
      subOrder.masterOrder.userId,
      "Cập nhật trạng thái đơn hàng",
      `Đơn hàng ${subOrder.subOrderCode} đã được cập nhật trạng thái thành ${status}!`,
    );

    // Mô phỏng delivered sau 30s khi shop chuyển trạng thái sang shipping
    await orderQueue.add(
      "deliver-sub-order",
      { subOrderId: subOrder.id },
      { delay: 30 * 1000 },
    );

    return await orderRepository.updateSubOrder(prisma, subOrder.id, {
      status,
    });
  };

  handleRefundRequest = async (
    shopId: string,
    refundId: string,
    actions: "APPROVE" | "REJECT",
  ) => {
    const refundRequest = await refundRepository.findRefundById(refundId);
    if (!refundRequest)
      throw new NotFoundError("Không tìm thấy yêu cầu trả hàng");

    if (refundRequest.subOrder.shopId !== shopId) {
      throw new ValidationError(
        "Bạn không có quyền xử lý yêu cầu trả hàng này!",
      );
    }

    if (refundRequest.status !== RefundStatus.REQUESTED) {
      throw new ValidationError(
        "Yêu cầu trả hàng đang ở trạng thái không thể xử lý!",
      );
    }

    await prisma.$transaction(async (tx) => {
      if (actions === "REJECT") {
        await refundRepository.updateRefund(tx, refundId, {
          status: RefundStatus.REJECTED,
        });
        // Send Notification
        await notificationService.createNotification(
          refundRequest.subOrder.masterOrder.userId,
          "Yêu cầu hủy đơn bị từ chối",
          `Yêu cầu hủy đơn hàng ${refundRequest.subOrder.subOrderCode} đã bị từ chối!`,
        );
        return;
      }

      // APPROVE
      await refundRepository.updateRefund(tx, refundId, {
        status: RefundStatus.APPROVED,
      });

      // Update Sub Order Status to RETURNED
      await orderRepository.updateSubOrder(tx, refundRequest.subOrder.id, {
        status: OrderStatus.CANCELLED,
      });

      if (refundRequest.payment.paymentMethod === PaymentMethod.COD) {
        // Release Stock
        await inventoryService.releaseStock(
          tx,
          refundRequest.subOrder.orderItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        );
      } else {
        await inventoryService.incrementStock(
          tx,
          refundRequest.subOrder.orderItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        );
      }

      // Send Notification
      await notificationService.createNotification(
        refundRequest.subOrder.masterOrder.userId,
        "Yêu cầu hủy đơn được chấp thuận",
        `Yêu cầu hủy đơn hàng ${refundRequest.subOrder.subOrderCode} đã được chấp thuận!`,
      );
    });
  };

  confirmReceived = async (
    userId: string,
    subOrderId: string,
    idempotency: {
      key: string;
      lockValue: string;
      lockKey: string;
      requestHash: string;
    },
  ) => {
    try {
      const subOrder = await orderRepository.findSubOrderById(subOrderId);
      if (!subOrder) throw new NotFoundError("Không tìm thấy đơn hàng");

      if (subOrder.masterOrder.userId !== userId) {
        throw new ValidationError("Bạn không có quyền xác nhận đơn hàng này!");
      }

      await orderRepository.updateSubOrder(prisma, subOrderId, {
        status: OrderStatus.COMPLETED,
      });

      // Send Notification
      await notificationService.createNotification(
        userId,
        "Xác nhận nhận hàng thành công",
        `Đơn hàng ${subOrder.subOrderCode} đã được xác nhận nhận hàng thành công!`,
      );

      const result = {
        message: "Xác nhận nhận hàng thành công!",
      };

      const responseWrapper = {
        requestHash: idempotency.requestHash,
        data: result,
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

      return result;
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

export default new OrderService();
