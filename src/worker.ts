import { getPendingJobsWithDetails, updateJobStatus } from "./db/queries/jobs.js";
import { transformPayload, ProcessingType } from "./processing/actions.js";

async function processJobs() {
  const pendingJobs = await getPendingJobsWithDetails();

  for (const job of pendingJobs) {
    try {
      await updateJobStatus(job.id, "processing");

      const finalPayload = transformPayload(job.payload, job.processingType as ProcessingType);

      console.log(`[Worker] Job ${job.id} processed as ${job.processingType}.`);
      console.log(`[Worker] Result: ${finalPayload}`);
      
      await updateJobStatus(job.id, "completed");

    } catch (err) {
      console.error(`[Worker] Error processing job ${job.id}:`, err);
      await updateJobStatus(job.id, "failed");
    }
  }
}

console.log("Worker is running...");
setInterval(processJobs, 10000);