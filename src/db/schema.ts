import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

//create pipelines table
export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  processingType: varchar("processing_type", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//create subscribers table
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  targetUrl: varchar("target_url", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id),
  payload: varchar("payload", { length: 2000 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),

  retryCount: integer("retry_count").notNull().default(0),
  lastError: varchar("last_error", { length: 1000 }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
