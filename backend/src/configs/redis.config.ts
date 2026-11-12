import { Redis } from "ioredis";
import env from "./env.config.js";
import logger from "@/utils/logger.util.js";

const redis = new Redis({
  host: env.REDIS_HOST,
  password: env.REDIS_PASSWORD,
  port: env.REDIS_PORT,

  lazyConnect: true,

  maxRetriesPerRequest: 3,

  enableReadyCheck: true,

  maxLoadingRetryTime: 1_000,

  retryStrategy(times: number): number | null {
    const delay = Math.min(times * 500, 5_000);

    logger.warn(`Redis reconnect attempt #${times}. Retrying in ${delay}ms.`);

    return delay;
  },
});

redis.on("connect", (): void => {
  logger.info("Redis connected successfully.");
});

redis.on("ready", (): void => {
  logger.info("Redis is ready.");
});

redis.on("reconnecting", (delay: number): void => {
  logger.warn(`Redis reconnecting in ${delay}ms.`);
});

redis.on("end", (): void => {
  logger.warn("Redis connection closed.");
});

redis.on("error", (error: Error): void => {
  logger.error(`Redis error: ${error.message}`);
});

export default redis;
