import { getPendingJobs, updateJobStatus } from "./db/queries/jobs.js";

async function processJobs() {
  // Fetch all pending jobs that are waiting to be processed
  const pendingJobs = await getPendingJobs();

  if (pendingJobs.length > 0) {
    console.log(`[Worker] Found ${pendingJobs.length} jobs to process.`);
  }

  for (const job of pendingJobs) {
    try {
      console.log(`[Worker] Processing job ${job.id}...`);
      
      // Update status to 'processing' so no other worker instance picks it up
      await updateJobStatus(job.id, "processing");

      // TODO: Implement processing logic (e.g., Uppercase conversion) in the next phase
      // For now, we are just logging the payload as a simulation
      console.log(`[Worker] Payload is: ${job.payload}`);

      // Mark the job as completed successfully
      await updateJobStatus(job.id, "completed");
      console.log(`[Worker] Job ${job.id} done!`);

    } catch (err) {
      console.error(`[Worker] Error processing job ${job.id}:`, err);
      // Update status to 'failed' if an error occurs during processing
      await updateJobStatus(job.id, "failed");
    }
  }
}

// Polling: Run the worker every 10 seconds
console.log("Worker is running and waiting for jobs...");
setInterval(processJobs, 10000);