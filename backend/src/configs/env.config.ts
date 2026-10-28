import dotenv from "dotenv";
dotenv.config();

interface ENV {
  PORT: number;
  DATABASE_URL: string;
  NODE_ENV: string;
  JWT_ACCESS: string;
  JWT_REFRESH: string;
  REDIS_PORT: number;
  REDIS_HOST: string;
  REDIS_PASSWORD: string;
  CORS_ORIGIN: string;
}

const env: ENV = {
  PORT: Number(process.env["PORT"]),
  DATABASE_URL: process.env["DATABASE_URL"]!,
  NODE_ENV: process.env["NODE_ENV"]!,
  JWT_ACCESS: process.env["JWT_ACCESS"]!,
  JWT_REFRESH: process.env["JWT_REFRESH"]!,
  REDIS_PORT: Number(process.env["REDIS_PORT"]),
  REDIS_HOST: process.env["REDIS_HOST"]!,
  REDIS_PASSWORD: process.env["REDIS_PASSWORD"]!,
  CORS_ORIGIN: process.env["CORS_ORIGIN"]!,
};

export default env;
