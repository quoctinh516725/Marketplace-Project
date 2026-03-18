import { Queue } from "bullmq";
import redis from "../config/redis";

export const cleanupQueue = new Queue("cleanup", { connection: redis });
