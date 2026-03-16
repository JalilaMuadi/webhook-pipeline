import { db } from "../index.js";
import { jobs } from "../schema.js";

export async function createJob(pipelineId: string, payload: string) {
  const [newJob] = await db.insert(jobs).values({
    pipelineId,
    payload,
  }).returning();
  
  return newJob;
}