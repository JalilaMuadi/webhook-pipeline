import { getPendingJobsWithDetails, updateJobStatus } from "./db/queries/jobs.js";

async function processJobs() {
  const pendingJobs = await getPendingJobsWithDetails();

  for (const job of pendingJobs) {
    try {
      await updateJobStatus(job.id, "processing");

      let finalPayload = job.payload;

      switch (job.processingType) {
        case "uppercase":
          finalPayload = job.payload.toUpperCase();
          break;
        case "lowercase":
          finalPayload = job.payload.toLowerCase();
          break;
        default:
          console.log(`[Worker] Unknown type: ${job.processingType}, skipping...`);
      }

      console.log(`[Worker] Job ${job.id} processed as ${job.processingType}.`);
      console.log(`[Worker] Result: ${finalPayload}`);

      await updateJobStatus(job.id, "completed");

    } catch (err) {
      console.error(`[Worker] Error:`, err);
      await updateJobStatus(job.id, "failed");
    }
  }
}

setInterval(processJobs, 10000);