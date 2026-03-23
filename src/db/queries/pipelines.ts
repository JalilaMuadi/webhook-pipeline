import { db } from "../index.js";
import { pipelines } from "../schema.js";
import { eq } from "drizzle-orm";

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

// GET a single pipeline by ID
export async function getPipelineById(id: string) {
  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, id));
  return pipeline;
}

// UPDATE an existing pipeline
export async function updatePipeline(
  id: string,
  data: Partial<{ name: string; processingType: string }>,
) {
  const [updated] = await db
    .update(pipelines)
    .set(data)
    .where(eq(pipelines.id, id))
    .returning();
  return updated;
}

// DELETE a pipeline
export async function deletePipeline(id: string) {
  const [deleted] = await db
    .delete(pipelines)
    .where(eq(pipelines.id, id))
    .returning();
  return deleted;
}
