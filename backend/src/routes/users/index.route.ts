import { Router } from "express";
import {
  registerSchema,
  loginSchema,
  handleSchema,
  updateSchema,
} from "@/validators/users.validator.js";
import validate from "@middlewares/validate.middleware.js";
import UserController from "@controllers/users/index.controller.js";
import auth from "@middlewares/auth.middleware.js";
import { profileRateLimit, authRateLimit } from "@utils/rateLimiters.util.js";

export const router: Router = Router();

router.post(
  "/register",
  authRateLimit,
  validate(registerSchema),
  UserController.register,
);

router.post(
  "/login",
  authRateLimit,
  validate(loginSchema),
  UserController.login,
);

router.get("/me", auth, profileRateLimit, UserController.profile);

router.patch(
  "/me",
  auth,
  profileRateLimit,
  validate(updateSchema),
  UserController.updateProfile,
);

router.put(
  "/handle",
  auth,
  profileRateLimit,
  validate(handleSchema),
  UserController.updateHandle,
);

router.post("/refresh", authRateLimit, UserController.refresh);

router.post("/logout", auth, authRateLimit, UserController.logout);
