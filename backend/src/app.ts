import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import globalErrorHandler from "@middlewares/error.middleware.js";
import env from "@configs/env.config.js";
import router from "@routes/index.route.js";

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);
app.use(helmet());
app.use(
  helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }),
);

app.use("/api/v1", router);

app.use(globalErrorHandler);

export default app;
