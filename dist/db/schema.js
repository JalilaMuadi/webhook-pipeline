import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
export const pipelines = pgTable("pipelines", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    processing_type: varchar("processing_type").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    //updated_at: timestamp("updated_at").notNull().defaultNow(),
    //is_active: boolean("is_active").notNull().default(true),
});
