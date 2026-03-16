// src/index.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { pipelines } from "./db/schema.js";

import express, { Request, Response, NextFunction } from "express";

import {
  createPipeline,
  getPipelines
} from "./db/queries/pipelines.js";

import {
  createSubscriber,
  getSubscribersByPipelineId,
} from "./db/queries/subscribers.js";

import {
  createJob
} from "./db/queries/jobs.js";

// ============================= 
// Express app setup
const app = express();
const PORT = 3000;
app.use(express.json());

// ============= pipeline routes ============
//get all pipelines 
app.get("/api/pipelines", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pipelines = await getPipelines();
    res.status(200).json(pipelines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create a new pipeline
app.post("/api/pipelines", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, processingType } = req.body;
    if (!name || !processingType) {
      return res.status(400).json({ error: "Missing name or processing_type" });
    }

    const newPipeline = await createPipeline(name, processingType);
    res.status(201).json(newPipeline);
  } catch (err) {
    next(err);
  }
});

// ============= subscriber routes ============
// Get subscribers for a pipeline
app.get("/api/pipelines/:id/subscribers", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const pipelineSubscribers = await getSubscribersByPipelineId(id);
    res.status(200).json(pipelineSubscribers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create subscriber for a pipeline
app.post("/api/pipelines/:id/subscribers", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { targetUrl } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: "Missing targetUrl" });
    }

    const newSubscriber = await createSubscriber(id, targetUrl);
    res.status(201).json(newSubscriber);
  } catch (err) {
    next(err);
  }
});

// ============= job routes ============
// Create a new job for a pipeline
// Webhook Ingestion Route
app.post("/api/ingest/:pipelineId", async (req: Request, res: Response) => {
  try {
    const pipelineId = req.params.pipelineId as string;

    if (!req.body) {
      return res.status(400).json({ error: "Empty payload" });
    }

    const payload = JSON.stringify(req.body);

    const job = await createJob(pipelineId, payload);

    res.status(202).json({
      message: "Webhook received and queued",
      jobId: job.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to queue job" });
  }
});

// =============================
// Error middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});


// =============================
// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});