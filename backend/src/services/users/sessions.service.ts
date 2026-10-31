import crypto from "node:crypto";
import redis from "@configs/redis.config.js";

const ACCESS_TOKEN_TTL = 20 * 60; // 20 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days

type TokenType = "access" | "refresh";

const TOKEN_CONFIG = {
  access: {
    prefix: "access",
    ttl: ACCESS_TOKEN_TTL,
  },
  refresh: {
    prefix: "refresh",
    ttl: REFRESH_TOKEN_TTL,
  },
} as const;

const getTokenKey = (publicId: string, type: TokenType): string => {
  return `${TOKEN_CONFIG[type].prefix}:${publicId}`;
};

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const storeToken = async (
  publicId: string,
  token: string,
  type: TokenType,
): Promise<"OK" | null> => {
  const key = getTokenKey(publicId, type);
  const { ttl } = TOKEN_CONFIG[type];

  return redis.set(key, hashToken(token), "EX", ttl);
};

export const verifyToken = async (
  publicId: string,
  token: string,
  type: TokenType,
): Promise<boolean> => {
  const key = getTokenKey(publicId, type);
  const storedHash = await redis.get(key);

  if (!storedHash) {
    return false;
  }

  const incomingHash = Buffer.from(hashToken(token), "hex");
  const existingHash = Buffer.from(storedHash, "hex");

  if (incomingHash.length !== existingHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(incomingHash, existingHash);
};

export const deleteToken = async (
  publicId: string,
  type: TokenType,
): Promise<number> => {
  const key = getTokenKey(publicId, type);

  return redis.del(key);
};
