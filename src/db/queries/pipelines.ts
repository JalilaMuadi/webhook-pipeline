import { db } from "../index.js";
import { pipelines } from "../schema.js";

// Create a new pipeline
export async function createPipeline(name: string, processingType: string) {
  const [newPipeline] = await db
    .insert(pipelines)
    .values({
      name,
      processingType,
    })
    .returning();
  return newPipeline;
}

// Get all pipelines
export async function getPipelines() {
  return await db.select().from(pipelines);
}
