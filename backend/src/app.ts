import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "node:url";

import globalErrorHandler from "@middlewares/error.middleware.js";
import env from "@configs/env.config.js";
import router from "@routes/index.route.js";
import { appRateLimit } from "@utils/rateLimiters.util.js";

const app: Express = express();

const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  }),
);

app.use(helmet());

app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  }),
);

const __FILENAME = fileURLToPath(import.meta.url);
const __DIRNAME = path.dirname(__FILENAME);

const publicDir = path.join(__DIRNAME, "public");

app.use(express.static(publicDir));

app.use(appRateLimit);

app.use("/", router);

app.get("*name", (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use(globalErrorHandler);

export default app;
