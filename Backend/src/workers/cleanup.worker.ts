import { Worker } from "bullmq";
import { cleanupQueue } from "../queues/cleanup.queue";
import idempotencyKeyRepository from "../repositories/idempotencyKey.repository";

// Add jon cleanup worker to delete expired idempotency keys
await cleanupQueue.add(
  "cleanup-expired-keys",
  {},
  {
    repeat: { every: 24 * 60 * 60 * 1000 },
    removeOnComplete: true,
    removeOnFail: true,
  },
);

// Worker to process cleanup queue
new Worker("cleanup", async (job) => {
  switch (job.name) {
    case "cleanup-expired-keys":
      const now = new Date();
      await idempotencyKeyRepository.deleteKey(now);
      break;
    default:
      break;
  }
});
