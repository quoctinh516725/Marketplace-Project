import { Worker } from "bullmq";
import redis from "../config/redis";
import { prisma } from "../config/prisma";
import orderRepository from "../repositories/order.repository";
import { OrderStatus } from "../constants/orderStatus";

new Worker(
  "orderQueue",
  async (job) => {
    const { orderId, userId } = job.data;

    const order = await orderRepository.findById(prisma, orderId, userId);

    if (!order) return;

    if (order.status === OrderStatus.PENDING_PAYMENT) {
      await orderRepository.updateOrder(prisma, orderId, {
        status: OrderStatus.CANCELLED,
      });
    }
  },
  { connection: redis, concurrency: 5 },
);
