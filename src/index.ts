// src/index.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { pipelines } from "./db/schema.js";

import express, { Request, Response, NextFunction } from "express";

import { 
  createPipeline, 
  getPipelines, 
  getPipelineById, 
  updatePipeline, 
  deletePipeline 
} from "./db/queries/pipelines.js";

import {
  createSubscriber,
  getSubscribersByPipelineId,
} from "./db/queries/subscribers.js";

import { createJob, getJobById } from "./db/queries/jobs.js";

// =============================
// Express app setup
const app = express();
const PORT = 5000;
app.use(express.json());

// ============= pipeline routes ============

// GET a single pipeline by ID
app.get("/api/pipelines/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const pipeline = await getPipelineById(id);

    if (!pipeline) 
      return res.status(404).json({ error: "Pipeline not found" });
    
    res.status(200).json(pipeline);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get all pipelines
app.get(
  "/api/pipelines",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pipelines = await getPipelines();
      res.status(200).json(pipelines);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// create a new pipeline
app.post(
  "/api/pipelines",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, processingType } = req.body;
      if (!name || !processingType) {
        return res
          .status(400)
          .json({ error: "Missing name or processing_type" });
      }

      const newPipeline = await createPipeline(name, processingType);
      res.status(201).json(newPipeline);
    } catch (err) {
      next(err);
    }
  },
);

// UPDATE a pipeline (PATCH)
app.patch("/api/pipelines/:id", async (req: Request, res: Response) => {
  try {
    const { name, processingType } = req.body;
    const id = req.params.id as string;
    const updatedPipeline = await updatePipeline(id, { name, processingType });
    
    if (!updatedPipeline) 
      return res.status(404).json({ error: "Pipeline not found" });

    res.status(200).json(updatedPipeline);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE a pipeline
app.delete("/api/pipelines/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await deletePipeline(id);

    if (!deleted) 
      return res.status(404).json({ error: "Pipeline not found" });

    res.status(200).json({ message: "Pipeline deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ============= subscriber routes ============
// Get subscribers for a pipeline
app.get(
  "/api/pipelines/:id/subscribers",
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const pipelineSubscribers = await getSubscribersByPipelineId(id);
      res.status(200).json(pipelineSubscribers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// Create subscriber for a pipeline
app.post(
  "/api/pipelines/:id/subscribers",
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);

// ============= job routes ============
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
      jobId: job.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to queue job" });
  }
});

// Get specific job status and details
app.get("/api/jobs/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const job = await getJobById(id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
const server = app
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("SERVER ERROR:", err);
  });

//process.stdin.resume();
