import { Queue } from "bullmq";
import redis from "../config/redis";

export const orderQueue = new Queue("orderQueue", {
  connection: redis,
});
