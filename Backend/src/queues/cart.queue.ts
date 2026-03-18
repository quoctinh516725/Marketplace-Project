import { Queue } from "bullmq";
import redis from "../config/redis";

export const cartQueue = new Queue("cartQueue", {
  connection: redis,
});
