import { CacheKey } from "../../cache/cache.key";
import cacheService from "../../cache/cache.service";
import cacheTag from "../../cache/cache.tag";
import CacheTag from "../../cache/cache.tag";
import { UserStatus } from "../../constants";
export type AuthUserCache = {
  id: string;
  status: UserStatus;
  roles: string[];
  permissions: string[];
  shopId?: string;
};

export async function addBlacklistToken(jti: string, ttl: number) {
  const key = CacheKey.auth.token.blacklist(jti);
  await cacheService.set(key, 1, ttl);
}

export async function isBlacklistToken(jti: string) {
  const key = CacheKey.auth.token.blacklist(jti);
  const check = await cacheService.get(key);
  return check !== null;
}

export async function getAuthUserCache(
  userId: string,
): Promise<AuthUserCache | null> {
  const key = CacheKey.auth.user(userId);
  return await cacheService.get(key);
}

export async function addAuthUserCache(user: AuthUserCache, ttl: number) {
  const key = CacheKey.auth.user(user.id);

  await cacheService.set(key, user, ttl);

  const tags = user.roles.map((r) => `role:${r}`);
  await Promise.all(tags.map((tag) => cacheTag.add(tag, key, ttl)));
  await cacheTag.add(`auth:user:${user.id}`, key, ttl);
}

export async function deleteAuthUserCache(userId: string) {
  await CacheTag.invalidateTag(`auth:user:${userId}`);
}
