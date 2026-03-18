import { Worker } from "bullmq";
import redis from "../config/redis";
import paymentRepository from "../repositories/payment.repository";
import { prisma } from "../config/prisma";
import { PaymentStatus } from "../constants/payment/paymentStatus";

new Worker(
  "paymentQueue",
  async (job) => {
    const { paymentId } = job.data;

    const payment = await paymentRepository.findById(prisma, paymentId);

    if (!payment) return;
    await paymentRepository.updateStatus(
      prisma,
      paymentId,
      PaymentStatus.EXPIRED,
    );
  },
  { connection: redis, concurrency: 5 },
);
