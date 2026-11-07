// src/queue/emailQueue.ts
import { Queue } from "bullmq";

export const emailQueue = new Queue("email-queue", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});
