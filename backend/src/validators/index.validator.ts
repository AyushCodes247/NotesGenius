import { z } from "zod";

const emailValidator = z
  .string()
  .trim()
  .email("Please provide a valid email address")
  .max(254, "Email cannot exceed 254 characters")
  .transform((value) => value.toLowerCase());

const passwordValidator = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9\s]/,
    "Password must contain at least one special character",
  )
  .regex(/^\S+$/, "Password cannot contain whitespace");

const usernameValidator = z
  .string()
  .min(3, "Username must contain at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*$/,
    "Username can contain only letters, numbers, and single underscores.",
  );

const userhandleValidator = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Userhandle must contain at least 3 characters")
  .max(30, "Userhandle cannot exceed 30 characters")
  .regex(
    /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
    "Userhandle can contain only lowercase letters, numbers, and single underscores.",
  );

export const registerSchema = z.object({
  body: z
    .object({
      email: emailValidator,
      password: passwordValidator,
      username: usernameValidator,
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: emailValidator,
      password: z
        .string()
        .min(1, "Password is required")
        .max(128, "Password cannot exceed 128 characters"),
    })
    .strict(),
});

export const updateSchema = z.object({
  body: z
    .object({
      username: usernameValidator,
    })
    .strict(),
});

export const handleSchema = z.object({
  body: z
    .object({
      userhandle: userhandleValidator,
    })
    .strict(),
});
