import axios from "axios";
import {
  getPendingJobsWithDetails,
  updateJobStatus,
  createDeliveryAttempt,
} from "./db/queries/jobs.js";

import { getSubscribersByPipelineId } from "./db/queries/subscribers.js";
import { transformPayload, ProcessingType } from "./processing/actions.js";
import { db } from "./db/index.js";
import { jobs } from "./db/schema.js";
import { eq } from "drizzle-orm";

const MAX_RETRIES = 3;

async function processJobs() {
  const pendingJobs = await getPendingJobsWithDetails();

  for (const job of pendingJobs) {
    try {
      await updateJobStatus(job.id, "processing");

      const finalPayload = transformPayload(
        job.payload,
        job.processingType as ProcessingType,
      );

      if (finalPayload === null) {
        console.log(`[Worker] Job ${job.id} was filtered out (skipped).`);
        await updateJobStatus(job.id, "completed");
        continue;
      }

      const subscribers = await getSubscribersByPipelineId(job.pipelineId);

      console.log(
        `[Worker] Sending job ${job.id} to ${subscribers.length} subscribers...`,
      );

      const deliveryResults = await Promise.allSettled(
        subscribers.map(async (sub) => {
          try {
            const response = await axios.post(
              sub.targetUrl,
              JSON.parse(finalPayload),
              {
                headers: { "Content-Type": "application/json" },
                timeout: 5000,
              },
            );

            await createDeliveryAttempt({
              jobId: job.id,
              subscriberId: sub.id,
              status: "success",
              statusCode: response.status,
            });

            return response;
          } catch (err: any) {
            await createDeliveryAttempt({
              jobId: job.id,
              subscriberId: sub.id,
              status: "failed",
              statusCode: err.response?.status,
              errorMessage: err.message,
            });

            throw err;
          }
        }),
      );

      const failures = deliveryResults.filter((r) => r.status === "rejected");

      if (failures.length > 0) {
        throw new Error(
          `${failures.length} subscribers failed to receive the webhook`,
        );
      }

      await updateJobStatus(job.id, "completed");
      console.log(`[Worker] Job ${job.id} completed successfully!`);
    } catch (err: any) {
      console.error(`[Worker] Error processing job ${job.id}:`, err.message);

      const currentRetry = (job as any).retryCount || 0;

      if (currentRetry < MAX_RETRIES) {
        console.log(
          `[Worker] Retrying job ${job.id} (${currentRetry + 1}/${MAX_RETRIES})...`,
        );
        await db
          .update(jobs)
          .set({
            status: "pending",
            retryCount: currentRetry + 1,
            lastError: err.message,
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, job.id));
      } else {
        console.log(`[Worker] Job ${job.id} failed after maximum retries.`);
        await db
          .update(jobs)
          .set({ status: "failed", lastError: err.message })
          .where(eq(jobs.id, job.id));
      }
    }
  }
}

console.log("Worker is running and listening for jobs (with Retry Logic)...");
setInterval(processJobs, 10000);
