import redis from "../config/redis";
import { KEY_PREFIX } from "./cache.key";

export const TAG_PREFIX = "tag:";

class CacheTag {
  async add(tag: string, key: string) {
    const tagkey = `${TAG_PREFIX}${tag}`;
    await redis.sadd(tagkey, key);
    // Thiết lập TTL cho tag để không bị memory leak
    await redis.expire(tagkey, 86400);
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
