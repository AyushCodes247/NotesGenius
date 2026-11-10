import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().int().positive().default(3000),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // PostgreSQL
  DATABASE_URL: z.string().min(1),

  // MongoDB
  MONGODB_URI: z
    .string()
    .min(1)
    .refine(
      (uri) => uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"),
      "Invalid MongoDB connection string.",
    ),

  // Authentication
  JWT_ACCESS: z.string().min(1),
  JWT_REFRESH: z.string().min(1),

  // Redis
  REDIS_HOST: z.string().min(1).default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().default(""),

  // CORS
  CORS_ORIGIN: z.string().min(1),

  // Gemini
  GEMINI_API_KEY: z.string().min(1),

  GEMINI_GENERATION_MODEL: z.string().min(1).default("gemini-3.8-flash"),

  GEMINI_EMBEDDING_MODEL: z.string().min(1).default("gemini-embedding-2"),

  GEMINI_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(3072),

  GEMINI_BASE_URL: z.string().min(1),

  // File uploads
  UPLOAD_PATHS: z.string().min(1),

  // Web Context
  TAVILY_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");

  console.error(z.treeifyError(parsedEnv.error));

  process.exit(1);
}

export type ENV = z.infer<typeof envSchema>;

const env: ENV = parsedEnv.data;

export default env;
