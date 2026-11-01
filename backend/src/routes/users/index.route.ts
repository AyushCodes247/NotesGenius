import { Router } from "express";
import {
  registerSchema,
  loginSchema,
  handleSchema,
  updateSchema,
} from "@validators/index.validator.js";
import validate from "@middlewares/validate.middleware.js";
import UserController from "@controllers/users/index.controller.js";
import auth from "@middlewares/auth.middleware.js";

export const router: Router = Router();

router.post("/register", validate(registerSchema), UserController.register);

router.post("/login", validate(loginSchema), UserController.login);

router.get("/me", auth, UserController.profile);

router.patch("/me", auth, validate(updateSchema), UserController.updateProfile);

router.put(
  "/handle",
  auth,
  validate(handleSchema),
  UserController.updateHandle,
);

router.post("/refresh", UserController.refresh);

router.post("/logout", auth, UserController.logout);
