import app from "@/app.js";
import http from "http";
import env from "@configs/env.config.js";
import redis from "@configs/redis.config.js";

const server = http.createServer(app);

async function startServer() {
  await redis.connect();
  server.listen(env.PORT, () => {
    console.info(`Server is running on PORT NO.: ${env.PORT}`);
  });
}

startServer();
