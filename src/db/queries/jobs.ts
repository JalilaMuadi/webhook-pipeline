import { db } from "../index.js";
import { jobs, pipelines, deliveryAttempts, subscribers } from "../schema.js";
import { eq, asc } from "drizzle-orm";

export async function createJob(pipelineId: string, payload: string) {
  const [newJob] = await db
    .insert(jobs)
    .values({
      pipelineId,
      payload,
    })
    .returning();

  return newJob;
}

// Get all pending jobs
export async function getPendingJobsWithDetails() {
  return await db
    .select({
      id: jobs.id,
      pipelineId: jobs.pipelineId,
      payload: jobs.payload,
      retryCount: jobs.retryCount,
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
    .set({ status, updatedAt: new Date() })
    .where(eq(jobs.id, id));
}

// Get job details by ID
export async function getJobById(id: string) {
  const [job] = await db
    .select({
      id: jobs.id,
      status: jobs.status,
      payload: jobs.payload,
      retryCount: jobs.retryCount,
      lastError: jobs.lastError,
      createdAt: jobs.createdAt,
      pipelineName: pipelines.name,
      processingType: pipelines.processingType,
    })
    .from(jobs)
    .innerJoin(pipelines, eq(jobs.pipelineId, pipelines.id))
    .where(eq(jobs.id, id));

  if (!job) return null;

  const attempts = await db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.jobId, id))
    .orderBy(asc(deliveryAttempts.createdAt));

  return {
    ...job,
    deliveryAttempts: attempts,
  };
}

export async function createDeliveryAttempt(data: {
  jobId: string;
  subscriberId: string;
  status: string;
  statusCode?: number;
  errorMessage?: string;
}) {
  await db.insert(deliveryAttempts).values(data);
}
