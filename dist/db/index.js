import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { readConfig } from "../config.js";
const cfg = readConfig();
const client = postgres(cfg.db.url);
export const db = drizzle(client, { schema });
