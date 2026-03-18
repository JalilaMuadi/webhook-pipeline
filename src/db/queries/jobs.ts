import { pipeline } from "node:stream";
import { db } from "../index.js";
import { jobs, pipelines } from "../schema.js";
import { eq, asc } from "drizzle-orm";

export async function createJob(pipelineId: string, payload: string) {
  const [newJob] = await db.insert(jobs).values({
    pipelineId,
    payload,
  }).returning();

  return newJob;
}

// Get all pending jobs
export async function getPendingJobsWithDetails() {
  return await db
    .select({
      id: jobs.id,
      pipelineId: jobs.pipelineId,
      payload: jobs.payload,
      processingType: pipelines.processingType,
    })
    .from(jobs)
    .innerJoin(pipelines, eq(jobs.pipelineId, pipelines.id))
    .where(eq(jobs.status, "pending"))
    .orderBy(asc(jobs.createdAt));
}
   

// Update job status
export async function updateJobStatus(id: string, status: string) {
  await db
    .update(jobs)
    .set({ status })
    .where(eq(jobs.id, id));
}