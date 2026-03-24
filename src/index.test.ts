import { describe, it, expect } from "vitest";
import { createPipeline, getPipelines } from "./db/queries/pipelines.js";

describe("Pipeline Database Operations", () => {
  it("should create and retrieve a pipeline", async () => {
    const name = "Test Pipeline";
    const type = "passthrough";

    const newPipeline = await createPipeline(name, type);
    expect(newPipeline).toBeDefined();
    expect(newPipeline.name).toBe(name);

    const allPipelines = await getPipelines();
    expect(allPipelines.length).toBeGreaterThan(0);
  });
});
