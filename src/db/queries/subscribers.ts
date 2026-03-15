import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { subscribers } from "../schema.js";

// Create a new subscriber for a pipeline
export async function createSubscriber(pipelineId: string, targetUrl: string) {
  const [newSubscriber] = await db
    .insert(subscribers)
    .values({
      pipelineId,
      targetUrl,
    })
    .returning();

  return newSubscriber;
}

// Get all subscribers for a specific pipeline
export async function getSubscribersByPipelineId(pipelineId: string) {
  return await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.pipelineId, pipelineId));
}