import redis from "@configs/redis.config.js";

const NOTES_CACHE_TTL = 5 * 60; // 5 minutes

type NoteCacheType = "all" | "single";

const NOTE_CACHE_CONFIG = {
  all: {
    prefix: "notes:all",
    ttl: NOTES_CACHE_TTL,
  },
  single: {
    prefix: "notes:single",
    ttl: NOTES_CACHE_TTL,
  },
} as const;

const getNoteKey = (
  userPublicId: string,
  type: NoteCacheType,
  notePublicId?: string,
): string => {
  const config = NOTE_CACHE_CONFIG[type];

  if (type === "single" && !notePublicId) {
    throw new Error("notePublicId is required for single note cache.");
  }

  if (type === "single") {
    return `${config.prefix}:${userPublicId}:${notePublicId}`;
  }

  return `${config.prefix}:${userPublicId}`;
};

const get = async (
  userPublicId: string,
  type: NoteCacheType,
  notePublicId?: string,
) => {
  const key = getNoteKey(userPublicId, type, notePublicId);

  const cached = await redis.get(key);

  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
};

const set = async (
  userPublicId: string,
  type: NoteCacheType,
  data: unknown,
  notePublicId?: string,
): Promise<void> => {
  const key = getNoteKey(userPublicId, type, notePublicId);

  const ttl = NOTE_CACHE_CONFIG[type].ttl;

  await redis.set(key, JSON.stringify(data), "EX", ttl);
};

const invalidate = async (
  userPublicId: string,
  type: NoteCacheType,
  notePublicId?: string,
): Promise<number> => {
  const key = getNoteKey(userPublicId, type, notePublicId);

  return redis.del(key);
};

const invalidateNote = async (
  userPublicId: string,
  notePublicId: string,
): Promise<number> => {
  return redis.del(
    getNoteKey(userPublicId, "all"),
    getNoteKey(userPublicId, "single", notePublicId),
  );
};

const notesCacheService = {
  get,
  set,
  invalidate,
  invalidateNote,
};

export default notesCacheService;
