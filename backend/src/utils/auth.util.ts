import env from "@configs/env.config.js";
import argon2 from "argon2";
import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";

export interface TokenPayload {
  publicId: string;
  username: string;
}

type TokenType = "access" | "refresh";

interface TokenConfiguration {
  secret: string;
  expiresIn: SignOptions["expiresIn"];
}

const JWT_ISSUER = "notesGenius";
const JWT_AUDIENCE = "notesGenius_api";
const JWT_ALGORITHM = "HS256" as const;

const TOKEN_CONFIG = {
  access: {
    secret: env.JWT_ACCESS,
    expiresIn: "20m",
  },
  refresh: {
    secret: env.JWT_REFRESH,
    expiresIn: "7d",
  },
} satisfies Record<TokenType, TokenConfiguration>;

// Argon2id configuration
type Argon2Options = NonNullable<Parameters<typeof argon2.hash>[1]>;

const ARGON2_OPTIONS: Argon2Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

// Generate JWT
const generateToken = (payload: TokenPayload, type: TokenType): string => {
  const config = TOKEN_CONFIG[type];

  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn,
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    jwtid: crypto.randomUUID(),
  });
};

// Verify JWT
const verifyToken = (token: string, type: TokenType): TokenPayload => {
  const config = TOKEN_CONFIG[type];

  const decoded = jwt.verify(token, config.secret, {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded["publicId"] !== "string" ||
    typeof decoded["username"] !== "string"
  ) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }

  return {
    publicId: decoded["publicId"],
    username: decoded["username"],
  };
};

// Access token
export const generateAccessToken = (payload: TokenPayload): string =>
  generateToken(payload, "access");

export const verifyAccessToken = (token: string): TokenPayload =>
  verifyToken(token, "access");

// Refresh token
export const generateRefreshToken = (payload: TokenPayload): string =>
  generateToken(payload, "refresh");

export const verifyRefreshToken = (token: string): TokenPayload =>
  verifyToken(token, "refresh");

// Password hashing
export const hashPassword = (password: string): Promise<string> =>
  argon2.hash(password, ARGON2_OPTIONS);

export const verifyPassword = (
  hashedPassword: string,
  password: string,
): Promise<boolean> => argon2.verify(hashedPassword, password);
