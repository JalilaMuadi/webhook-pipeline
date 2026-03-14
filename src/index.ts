import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { pipelines } from "./db/schema.js";

const pool = new Pool({
  connectionString: process.env.DB_URL || "postgres://postgres:postgres@localhost:5432/chirpy?sslmode=disable",
});

const db = drizzle(pool);

async function testDB() {
  const all = await db.select().from(pipelines);
  console.log("pipelines:", all);
}

testDB();