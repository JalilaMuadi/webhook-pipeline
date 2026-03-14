// src/index.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./db/index.js"; 
import { pipelines } from "./db/schema.js";

import express, {Request, Response, NextFunction} from "express";

import { createPipeline, getPipelines } from "./db/queries/pipelines.js";

// ============================= 
// Express app setup
const app = express();
const PORT = 3000;
app.use(express.json());

// =============================
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

// =============================
// create a new pipeline
app.post("/api/pipelines", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, processing_type } = req.body;
    if (!name || !processing_type) {
      return res.status(400).json({ error: "Missing name or processing_type" });
    }

    const newPipeline = await createPipeline(name, processing_type);
    res.status(201).json(newPipeline);
  } catch (err) {
    next(err);
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