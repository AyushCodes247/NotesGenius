import { Router } from "express";
import {
  registerSchema,
  loginSchema,
  updateSchema,
  handleSchema,
} from "@validators/index.validator.js";
import validate from "@middlewares/validate.middleware.js";

export const router: Router = Router();

// Register
router.post("/register", validate(registerSchema));

// // Login
// router.post("/login");

// // Profile
// router.get("/me");

// Update the username
// router.patch("/me");

// Create or Update Handle
// router.put("/handle");

// Refresh Token
// router.post("/refresh");

// Logout
// router.post("/logout");
