import { pgTable, uuid, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

//create pipelines table
export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  processingType: varchar("processing_type", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  //updated_at: timestamp("updated_at").notNull().defaultNow(),
  //is_active: boolean("is_active").notNull().default(true),
});

//create subscribers table
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id").notNull(),
  targetUrl: varchar("target_url", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});