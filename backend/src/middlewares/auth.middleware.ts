import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";

import db from "@/index.js";
import { userTable } from "@schemas/user.schema";
import { AppError, asyncHandler } from "@utils/general.util.js";
import { verifyAccessToken } from "@utils/auth.util.js";

import { verifyToken } from "@services/users/sessions.service.js";
import {
  cacheProfile,
  getCachedProfile,
} from "@services/users/profile.service.js";

interface CachedProfile {
  publicId: string;
  username: string;
  email: string;
  userhandle: string;
  createdAt: string;
}

const isCachedProfile = (value: unknown): value is CachedProfile => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const profile = value as Record<string, unknown>;

  if (
    typeof profile["publicId"] !== "string" ||
    typeof profile["username"] !== "string" ||
    typeof profile["email"] !== "string" ||
    typeof profile["userhandle"] !== "string" ||
    typeof profile["createdAt"] !== "string"
  ) {
    return false;
  }

  return !Number.isNaN(Date.parse(profile["createdAt"]));
};

const auth: RequestHandler = asyncHandler(
  async (req, _res, next): Promise<void> => {
    // 1. Extract access token.
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Unauthorized", 401);
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    // 2. Verify access JWT.
    const payload = (() => {
      try {
        return verifyAccessToken(token);
      } catch {
        throw new AppError("Unauthorized", 401);
      }
    })();

    // 3. Verify active Redis session.
    const isValidSession = await verifyToken(payload.publicId, token, "access");

    if (!isValidSession) {
      throw new AppError("Unauthorized", 401);
    }

    // 4. Try retrieving the cached profile.
    const cachedProfile = await getCachedProfile(payload.publicId);

    if (cachedProfile) {
      let parsedProfile: unknown;

      try {
        parsedProfile = JSON.parse(cachedProfile);
      } catch {
        parsedProfile = null;
      }

      // 5. Validate cached data before trusting it.
      if (
        isCachedProfile(parsedProfile) &&
        parsedProfile.publicId === payload.publicId
      ) {
        req.user = {
          publicId: parsedProfile.publicId,
          username: parsedProfile.username,
          email: parsedProfile.email,
          userhandle: parsedProfile.userhandle,
          createdAt: new Date(parsedProfile.createdAt),
        };

        next();
        return;
      }
    }

    // 6. Cache miss or invalid cache: fetch from PostgreSQL.
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.publicId, payload.publicId),
      columns: {
        publicId: true,
        username: true,
        email: true,
        userHandle: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    // 7. Populate Redis with the latest database profile.
    await cacheProfile(payload.publicId, {
      publicId: user.publicId,
      username: user.username,
      email: user.email,
      userhandle: user.userHandle,
      createdAt: user.createdAt,
    });

    // 8. Attach authenticated user to the request.
    req.user = {
      publicId: user.publicId,
      username: user.username,
      email: user.email,
      userhandle: user.userHandle,
      createdAt: user.createdAt,
    };

    next();
  },
);

export default auth;
