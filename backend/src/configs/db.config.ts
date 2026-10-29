import env from "./env.config.js";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@schemas/schema.js";

const db: NodePgDatabase<typeof schema> = drizzle(env.DATABASE_URL, {
  schema,
});

export default db;
