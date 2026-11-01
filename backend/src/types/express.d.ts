import "express";

declare global {
  namespace Express {
    interface User {
      publicId: string;
      username: string;
      email: string;
      userhandle: string;
      createdAt: Date;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
