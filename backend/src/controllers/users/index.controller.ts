import type { Request, Response, RequestHandler } from "express";

import { asyncHandler, AppError } from "@utils/general.util.js";
import UserService from "@services/users/index.service.js";
import env from "@configs/env.config.js";

const REFRESH_COOKIE = "notesGenius_cookie";

const getRefreshCookieOptions = () => {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_COOKIE, refreshToken, getRefreshCookieOptions());
};

const clearRefreshCookie = (res: Response): void => {
  const isProduction = env.NODE_ENV === "production";

  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    path: "/",
  });
};

const getAuthenticatedUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  return req.user;
};

class UserController {
  register: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { username, userhandle, email, password } = req.body;

      const { user, accessToken, refreshToken } = await UserService.register({
        username,
        userhandle,
        email,
        password,
      });

      if (!accessToken || !refreshToken) {
        throw new AppError("Unable to establish user session.", 500);
      }

      setRefreshCookie(res, refreshToken);

      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        user,
        accessToken,
      });
    },
  );

  updateProfile: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { publicId } = getAuthenticatedUser(req);
      const { username } = req.body;

      const user = await UserService.updateProfile(publicId, username);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user,
      });
    },
  );

  updateHandle: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { publicId } = getAuthenticatedUser(req);
      const { userhandle } = req.body;

      const user = await UserService.updateHandle(publicId, userhandle);

      res.status(200).json({
        success: true,
        message: "User handle updated successfully.",
        user,
      });
    },
  );

  login: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      const { user, accessToken, refreshToken } = await UserService.login({
        email,
        password,
      });

      if (!accessToken || !refreshToken) {
        throw new AppError("Unable to establish user session.", 500);
      }

      setRefreshCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        message: "User logged in successfully.",
        user,
        accessToken,
      });
    },
  );

  profile: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = getAuthenticatedUser(req);

      res.status(200).json({
        success: true,
        message: "Profile fetched successfully.",
        user: {
          publicId: user.publicId,
          username: user.username,
          email: user.email,
          userhandle: user.userhandle,
          createdAt: user.createdAt,
        },
      });
    },
  );

  logout: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { publicId } = getAuthenticatedUser(req);

      await UserService.logout(publicId);

      clearRefreshCookie(res);

      res.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    },
  );

  refresh: RequestHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const refreshToken = req.cookies?.[REFRESH_COOKIE];

      if (typeof refreshToken !== "string" || !refreshToken) {
        clearRefreshCookie(res);
        throw new AppError("Refresh token is required.", 401);
      }

      const result = await UserService.refresh(refreshToken);

      if (!result.accessToken || !result.refreshToken) {
        clearRefreshCookie(res);
        throw new AppError("Unable to refresh user session.", 500);
      }

      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        message: "Session refreshed successfully.",
        user: result.user,
        accessToken: result.accessToken,
      });
    },
  );
}

export default new UserController();
