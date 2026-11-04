import { Router } from "express";
import auth from "@middlewares/auth.middleware.js";
import documentAuthentication from "@middlewares/upload.middleware.js";

export const router: Router = Router();

router.post("/upload", auth, documentAuthentication);
