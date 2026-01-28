import redis from "../config/redis";
export const DEFAULT_TTL = 3000;
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log(`Lỗi khi lấy cache với ${key}: ${error}`);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = DEFAULT_TTL) {
    try {
      const data = JSON.stringify(value);
      await redis.set(key, data, "EX", ttl);
    } catch (error) {
      console.log(`Lỗi khi set cache với ${key}: ${error}`);
    }
  }
}

export default new CacheService();
