import app from "@/app.js";
import http from "http";
import env from "@configs/env.config.js";
import redis from "@configs/redis.config.js";
import connectDB from "@configs/db.config.js";
import logger from "./utils/logger.util.js";

const server = http.createServer(app);

async function startServer() {
  try {
    await connectDB(env.MONGODB_URI);

    try {
      await redis.connect();
      logger.info("Redis connected successfully.");
    } catch (error) {
      logger.error(
        {
          err: error instanceof Error ? error : new Error(String(error)),
        },
        "Redis unavailable. Starting server without Redis.",
      );
    }

    server.listen(env.PORT, () => {
      logger.info(`Server is running on PORT NO.: ${env.PORT}`);
    });
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
      },
      "Critical database connection failed.",
    );
    process.exit(1);
  }
}

startServer();
