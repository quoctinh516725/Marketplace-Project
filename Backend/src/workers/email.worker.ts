import { Worker } from "bullmq";
import emailService from "../services/email/email.service";
import redis from "../config/redis";

new Worker(
  "emailQueue",
  async (job) => {
    const { orderId, userId } = job.data;
    switch (job.name) {
      case "ORDER_CREATED":
        await emailService.sendOrderEmail(orderId, userId);
        break;
      case "PAYMENT_SUCCESS":
        await emailService.sendPaymentSuccessEmail(orderId, userId);
        break;
    }
  },
  { connection: redis, concurrency: 5 },
);
