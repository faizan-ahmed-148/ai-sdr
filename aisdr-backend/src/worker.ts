// worker.js
import { Worker } from "bullmq";
import sendEmailProcessor from "./processors/sendEmailProcessor";

const worker = new Worker("email-queue", sendEmailProcessor, {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  concurrency: 50,
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} has been completed`);
});

worker.on("failed", (job:any, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});
