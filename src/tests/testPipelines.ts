import { createPipeline, getPipelines } from "../db/queries/pipelines.js";

async function test() {
  const newPipeline = await createPipeline("Test Pipeline", "uppercase");
  console.log("Created Pipeline:", newPipeline);

  const allPipelines = await getPipelines();
  console.log("All Pipelines:", allPipelines);
}

test().catch(console.error);
