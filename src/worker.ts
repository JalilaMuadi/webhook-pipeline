import axios from "axios";
import { getPendingJobsWithDetails, updateJobStatus } from "./db/queries/jobs.js";
import { getSubscribersByPipelineId } from "./db/queries/subscribers.js";
import { transformPayload, ProcessingType } from "./processing/actions.js";

async function processJobs() {
  const pendingJobs = await getPendingJobsWithDetails();

  for (const job of pendingJobs) {
    try {
      await updateJobStatus(job.id, "processing");

      const finalPayload = transformPayload(job.payload, job.processingType as ProcessingType);
      
      const subscribers = await getSubscribersByPipelineId(job.pipelineId);

      console.log(`[Worker] Sending job ${job.id} to ${subscribers.length} subscribers...`);

      const deliveryPromises = subscribers.map(sub => 
        axios.post(sub.targetUrl, JSON.parse(finalPayload), {
          headers: { 'Content-Type': 'application/json' }
        }).catch(err => {
          console.error(`[Worker] Failed to delivery to ${sub.targetUrl}: ${err.message}`);
        })
      );

      await Promise.all(deliveryPromises);

      await updateJobStatus(job.id, "completed");
      console.log(`[Worker] Job ${job.id} delivered and completed!`);

    } catch (err) {
      console.error(`[Worker] Fatal error processing job ${job.id}:`, err);
      await updateJobStatus(job.id, "failed");
    }
  }
}

console.log("Worker is running and listening for jobs...");
setInterval(processJobs, 10000);