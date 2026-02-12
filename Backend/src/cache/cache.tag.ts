import redis from "../config/redis";

export const TAG_PREFIX = "tag:";

class CacheTag {
  async add(tag: string, key: string, ttl: number): Promise<void> {
    const tagkey = `${TAG_PREFIX}${tag}`;
    await redis.sadd(tagkey, key);
    // Thiết lập TTL cho tag để không bị memory leak
    const currentTTL = await redis.ttl(tagkey);
    if (currentTTL < ttl) {
      await redis.expire(tagkey, ttl);
    }
  }
  async invalidateTag(tag: string) {
    const tagkey = `${TAG_PREFIX}${tag}`;

    const keys = await redis.smembers(tagkey);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.del(tagkey);
  }
}

export default new CacheTag();
