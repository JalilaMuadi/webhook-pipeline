import { db } from "../index.js";
import { jobs } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createJob(pipelineId: string, payload: string) {
  const [newJob] = await db.insert(jobs).values({
    pipelineId,
    payload,
  }).returning();

  return newJob;
}

// Get all pending jobs
export async function getPendingJobs() {
  return await db
    .select()
    .from(jobs)
    .where(eq(jobs.status, "pending"));
}

// Update job status
export async function updateJobStatus(id: string, status: string) {
  await db
    .update(jobs)
    .set({ status })
    .where(eq(jobs.id, id));
}