import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType } from "zod";
import { asyncHandler } from "@utils/general.util.js";

const validate = (schema: ZodType): RequestHandler => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      const parsedData = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (
        typeof parsedData === "object" &&
        parsedData !== null &&
        "body" in parsedData
      ) {
        req.body = parsedData.body;
      }

      next();
    },
  );
};

export default validate;
