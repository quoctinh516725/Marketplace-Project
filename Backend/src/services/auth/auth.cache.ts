import { CacheKey } from "../../cache/cache.key";
import cacheService from "../../cache/cache.service";


export async function addBlacklistToken(jti: string, ttl: number) {
  const key = CacheKey.auth.token.blacklist(jti);
  await cacheService.set(key, 1, ttl);
}

export async function isBlacklistToken(jti: string) {
  const key = CacheKey.auth.token.blacklist(jti);
  const check = await cacheService.get(key);
  return check !== null;
}

