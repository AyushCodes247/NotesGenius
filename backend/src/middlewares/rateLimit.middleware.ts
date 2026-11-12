import type { Request, Response, NextFunction, RequestHandler } from "express";
import redis from "@configs/redis.config.js";
import { AppError } from "@utils/general.util.js";

type RateLimitFailMode = "open" | "closed";

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
  failMode: RateLimitFailMode;
  keyGenerator?: (req: Request) => string;
}

const defaultKeyGenerator = (req: Request): string => {
  return req.user?.publicId ?? req.ip ?? "unknown";
};

const incrementWithExpiryScript = `
  local current = redis.call("INCR", KEYS[1])

  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  local ttl = redis.call("TTL", KEYS[1])

  return { current, ttl }
`;

const rateLimit = ({
  windowSeconds,
  maxRequests,
  keyPrefix,
  failMode,
  keyGenerator = defaultKeyGenerator,
}: RateLimitOptions): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const identifier = keyGenerator(req);

    const key = `rate-limit:${keyPrefix}:${identifier}`;

    try {
      const result = await redis.eval(
        incrementWithExpiryScript,
        1,
        key,
        windowSeconds,
      );

      const [currentCount, ttl] = result as [number, number];

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(maxRequests - currentCount, 0),
      );
      res.setHeader("X-RateLimit-Reset", Math.max(ttl, 0));

      if (currentCount > maxRequests) {
        if (ttl > 0) {
          res.setHeader("Retry-After", ttl);
        }

        throw new AppError("Too many requests. Please try again later.", 429);
      }

      next();
    } catch (error) {
      // Preserve an actual rate-limit rejection.
      if (error instanceof AppError && error.statusCode === 429) {
        throw error;
      }

      // Redis failure + fail-open → allow request.
      if (failMode === "open") {
        next();
        return;
      }

      // Redis failure + fail-closed → reject request.
      throw new AppError(
        "Rate limiting service is temporarily unavailable.",
        503,
      );
    }
  };
};

export default rateLimit;
