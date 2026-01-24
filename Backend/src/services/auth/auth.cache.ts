import { User } from "../../../generated/prisma/browser";
import { CacheKey } from "../../cache/cache.key";
import cacheService from "../../cache/cache.service";
import cacheTag from "../../cache/cache.tag";
import { cacheTTL } from "../../cache/cache.ttl";

type UserCache = Omit<User, "password"> & { roles: string[] };

export async function addBlacklistToken(jti: string, ttl: number) {
  const key = CacheKey.auth.token.blacklist(jti);
  await cacheService.set(key, 1, ttl);
}

export async function isBlacklistToken(jti: string) {
  const key = CacheKey.auth.token.blacklist(jti);
  const check = await cacheService.get(key);
  return check !== null;
}

export async function addUserCache(user: UserCache) {
  const key = CacheKey.auth.user.me(user.id);
  const ttl = cacheTTL.auth.me;
  await cacheService.set(key, user, ttl);
  await cacheTag.add(`user:${user.id}`, key);
}
