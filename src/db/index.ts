import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";

const connectionString = process.env.DB_URL || "postgres://postgres:postgres@localhost:5431/webhook?sslmode=disable";

console.log("Attempting to connect to database...");

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

console.log("Database client initialized.");