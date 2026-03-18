import { Queue } from "bullmq";
import redis from "../config/redis";

export const paymentQueue = new Queue("paymentQueue", {
  connection: redis,
});
