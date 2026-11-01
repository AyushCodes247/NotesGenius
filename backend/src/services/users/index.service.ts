import db from "@/index.js";
import { eq, or, sql } from "drizzle-orm";
import { userTable } from "@schemas/user.schema";
import { AppError } from "@utils/general.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from "@utils/auth.util.js";
import { storeToken, deleteToken, rotateTokens } from "./sessions.service.js";
import { deleteProfileCache } from "./profile.service.js";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  userhandle: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export interface GlobalPayload {
  user: {
    publicId: string;
    username: string;
    email: string;
    userhandle: string;
    createdAt?: Date;
  };
  accessToken?: string;
  refreshToken?: string;
}

const isDuplicateUserError = (error: unknown): boolean => {
  let current = error;

  while (current instanceof Error) {
    const databaseError = current as Error & {
      code?: string;
      constraint?: string;
    };

    if (
      databaseError.code === "23505" &&
      (!databaseError.constraint ||
        databaseError.constraint.includes("email") ||
        databaseError.constraint.includes("user_handle") ||
        databaseError.constraint.includes("userhandle"))
    ) {
      return true;
    }

    current = databaseError.cause;
  }

  return false;
};

class UserService {
  async register(registerPayload: RegisterPayload): Promise<GlobalPayload> {
    const email = registerPayload.email.trim().toLowerCase();
    const userhandle = registerPayload.userhandle
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

    const existingUser = await db
      .select({ publicId: userTable.publicId })
      .from(userTable)
      .where(
        or(
          sql`LOWER(${userTable.email}) = ${email}`,
          eq(userTable.userHandle, userhandle),
        ),
      )
      .limit(1);

    if (existingUser.length > 0) {
      throw new AppError("Email or userhandle already exists.", 409);
    }

    const hashedPassword = await hashPassword(registerPayload.password);

    let user;

    try {
      [user] = await db
        .insert(userTable)
        .values({
          username: registerPayload.username,
          email,
          passwordHash: hashedPassword,
          userHandle: userhandle,
          accountStatus: "active",
        })
        .returning({
          publicId: userTable.publicId,
          username: userTable.username,
          email: userTable.email,
          userhandle: userTable.userHandle,
          createdAt: userTable.createdAt,
        });
    } catch (error) {
      if (isDuplicateUserError(error)) {
        throw new AppError("Email or userhandle already exists.", 409);
      }

      throw error;
    }

    if (!user) {
      throw new AppError("Failed to register user.", 500);
    }

    const tokenPayload = {
      publicId: user.publicId,
      username: user.username,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await storeToken(user.publicId, accessToken, "access");
    await storeToken(user.publicId, refreshToken, "refresh");

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(loginPayload: LoginPayload): Promise<GlobalPayload> {
    const email = loginPayload.email.trim().toLowerCase();

    const user = await db.query.userTable.findFirst({
      where: sql`LOWER(${userTable.email}) = ${email}`,
    });

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isValidPassword = await verifyPassword(
      user.passwordHash,
      loginPayload.password,
    );

    if (!isValidPassword) {
      throw new AppError("Invalid email or password.", 401);
    }

    await db
      .update(userTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(userTable.publicId, user.publicId));

    const tokenPayload = {
      publicId: user.publicId,
      username: user.username,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await storeToken(user.publicId, accessToken, "access");
    await storeToken(user.publicId, refreshToken, "refresh");

    return {
      user: {
        username: user.username,
        email: user.email,
        publicId: user.publicId,
        userhandle: user.userHandle,
      },
      accessToken,
      refreshToken,
    };
  }

  async updateProfile(
    publicId: string,
    username: string,
  ): Promise<GlobalPayload> {
    const [user] = await db
      .update(userTable)
      .set({
        username,
        updatedAt: new Date(),
      })
      .where(eq(userTable.publicId, publicId))
      .returning({
        publicId: userTable.publicId,
        username: userTable.username,
        email: userTable.email,
        userhandle: userTable.userHandle,
      });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await deleteProfileCache(publicId);

    return { user };
  }

  async updateHandle(
    publicId: string,
    userhandle: string,
  ): Promise<GlobalPayload> {
    const normalizedHandle = userhandle.trim().replace(/^@/, "").toLowerCase();

    const [existingHandle] = await db
      .select({
        publicId: userTable.publicId,
      })
      .from(userTable)
      .where(eq(userTable.userHandle, normalizedHandle))
      .limit(1);

    if (existingHandle && existingHandle.publicId !== publicId) {
      throw new AppError("Userhandle is already taken.", 409);
    }

    if (existingHandle?.publicId === publicId) {
      const [user] = await db
        .select({
          publicId: userTable.publicId,
          username: userTable.username,
          email: userTable.email,
          userhandle: userTable.userHandle,
        })
        .from(userTable)
        .where(eq(userTable.publicId, publicId))
        .limit(1);

      if (!user) {
        throw new AppError("User not found.", 404);
      }

      return { user };
    }

    let user;

    try {
      [user] = await db
        .update(userTable)
        .set({
          userHandle: normalizedHandle,
          userHandleChangedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userTable.publicId, publicId))
        .returning({
          publicId: userTable.publicId,
          username: userTable.username,
          email: userTable.email,
          userhandle: userTable.userHandle,
        });
    } catch (error) {
      if (isDuplicateUserError(error)) {
        throw new AppError("Userhandle is already taken.", 409);
      }

      throw error;
    }

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await deleteProfileCache(publicId);

    return { user };
  }

  async refresh(refreshToken: string): Promise<GlobalPayload> {
    if (!refreshToken) {
      throw new AppError("Refresh token is required.", 401);
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (
      !decoded ||
      typeof decoded.publicId !== "string" ||
      typeof decoded.username !== "string"
    ) {
      throw new AppError("Invalid refresh token.", 401);
    }

    const user = await db.query.userTable.findFirst({
      where: eq(userTable.publicId, decoded.publicId),
      columns: {
        publicId: true,
        username: true,
        email: true,
        userHandle: true,
        createdAt: true,
      },
    });

    if (!user) {
      await Promise.all([
        deleteToken(decoded.publicId, "access"),
        deleteToken(decoded.publicId, "refresh"),
      ]);

      throw new AppError("User no longer exists.", 401);
    }

    const tokenPayload = {
      publicId: user.publicId,
      username: user.username,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const isRotated = await rotateTokens(
      user.publicId,
      refreshToken,
      newRefreshToken,
      newAccessToken,
    );

    if (!isRotated) {
      throw new AppError("Refresh session expired or revoked.", 401);
    }

    return {
      user: {
        publicId: user.publicId,
        username: user.username,
        email: user.email,
        userhandle: user.userHandle,
        createdAt: user.createdAt,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(publicId: string): Promise<void> {
    await Promise.all([
      deleteToken(publicId, "access"),
      deleteToken(publicId, "refresh"),
    ]);
  }
}

export default new UserService();
