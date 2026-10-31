import redis from "@configs/redis.config.js";

const PROFILE_CACHE_TTL = 5 * 60;

const getProfileKey = (publicId: string): string => {
  return `user:${publicId}`;
};

export const getCachedProfile = async (
  publicId: string,
): Promise<string | null> => {
  return redis.get(getProfileKey(publicId));
};

export const cacheProfile = async (
  publicId: string,
  profile: object,
): Promise<void> => {
  await redis.set(
    getProfileKey(publicId),
    JSON.stringify(profile),
    "EX",
    PROFILE_CACHE_TTL,
  );
};

export const deleteProfileCache = async (publicId: string): Promise<void> => {
  await redis.del(getProfileKey(publicId));
};
