import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  JWT_ACCESS: z.string().min(1),
  JWT_REFRESH: z.string().min(1),

  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_HOST: z.string().min(1),
  REDIS_PASSWORD: z.string().default(""),

  CORS_ORIGIN: z.string().min(1),

  GEMINI_API_KEY: z.string().min(1),
  GEMINI_GENERATION_MODEL: z.string().default("gemini-3.8-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-2"),
  GEMINI_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(3072),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export type ENV = z.infer<typeof envSchema>;

const env: ENV = parsedEnv.data;

export default env;
