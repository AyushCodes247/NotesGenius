import env from "./configs/env.config.js";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@schemas/schema";

const db: NodePgDatabase<typeof schema> = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  schema,
});

export default db;
