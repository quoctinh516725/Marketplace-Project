import { Worker } from "bullmq";
import redis from "../config/redis";
import { prisma } from "../config/prisma";
import orderRepository from "../repositories/order.repository";
import { OrderStatus } from "../constants/orderStatus";
import refundRepository from "../repositories/refund.repository";
import { RefundStatus } from "../constants/refundStatus";
import inventoryService from "../services/inventory/inventory.service";
import { PaymentMethod } from "../constants/payment/paymentMethod";

new Worker(
  "orderQueue",
  async (job) => {
    const { orderId, userId, refundId, subOrderId } = job.data;

    switch (job.name) {
      case "expire-order":
        const order = await orderRepository.findById(prisma, orderId, userId);

        if (!order) return;

        if (order.status === OrderStatus.PENDING_PAYMENT) {
          await prisma.$transaction(async (tx) => {
            await orderRepository.updateOrder(tx, orderId, {
              status: OrderStatus.CANCELLED,
            });

            const subTotalIds = order.subOrders.map((a) => a.id);
            // Update SubOrder Status
            await orderRepository.updateSubOrders(tx, subTotalIds, {
              status: OrderStatus.CANCELLED,
            });

            // Release Stock
            await inventoryService.releaseStock(
              tx,
              order.subOrders.flatMap((subOrder) =>
                subOrder.orderItems.map((item) => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                })),
              ),
            );
          });
        }
        break;
      case "refund-sub-order":
        const refund = await refundRepository.findRefundById(refundId);

        if (!refund) return;

        if (refund.status === RefundStatus.REQUESTED) {
          await prisma.$transaction(async (tx) => {
            await refundRepository.updateRefund(tx, refundId, {
              status: RefundStatus.APPROVED,
            });

            await orderRepository.updateSubOrder(tx, refund.subOrder.id, {
              status: OrderStatus.CANCELLED,
            });

            if (refund.payment.paymentMethod === PaymentMethod.COD) {
              // Release Stock
              await inventoryService.releaseStock(
                tx,
                refund.subOrder.orderItems.map((item) => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                })),
              );
            } else {
              await inventoryService.incrementStock(
                tx,
                refund.subOrder.orderItems.map((item) => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                })),
              );
            }
          });
        }
        break;

      case "deliver-sub-order":
        const subOrder = await orderRepository.findSubOrderById(subOrderId);

        if (!subOrder) return;
        if (subOrder.status === OrderStatus.SHIPPING) {
          await orderRepository.updateSubOrder(prisma, subOrderId, {
            status: OrderStatus.DELIVERED,
          });
        }
    }
  },
  { connection: redis, concurrency: 5 },
);
