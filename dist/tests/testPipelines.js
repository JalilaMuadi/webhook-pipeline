import { createPipeline, getPipelines } from "../db/queries/pipelines.js";
async function test() {
    // Create a new pipeline
    const newPipeline = await createPipeline("Test Pipeline", "Type A");
    console.log("Created Pipeline:", newPipeline);
    // Get all pipelines
    const pipelines = await getPipelines();
    console.log("All Pipelines:", pipelines);
}
test().catch(console.error);
