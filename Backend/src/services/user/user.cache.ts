import { User } from "../../../generated/prisma/client";
import { CacheKey } from "../../cache/cache.key";
import cacheService from "../../cache/cache.service";
import cacheTag from "../../cache/cache.tag";

type UserCache = Omit<User, "password"> & { roles: string[] };

export async function getUserCache(userId: string): Promise<UserCache | null> {
  const key = CacheKey.user.me(userId);
  return await cacheService.get(key);
}

export async function addUserCache(user: UserCache, ttl: number) {
  const key = CacheKey.user.me(user.id);
  await cacheService.set(key, user, ttl);
  await cacheTag.add(`user:${user.id}`, key, ttl);
}

export async function deleteUserCache(userId: string) {
  const key = CacheKey.user.me(userId);
  await cacheService.delete(key);
}
