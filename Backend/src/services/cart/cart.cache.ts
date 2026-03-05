import redis from "../../config/redis";
import { CartResponseDto } from "../../dtos/cart";

export const getCartItemCache = async (
  key: string,
  field: string,
): Promise<CartResponseDto | null> => {
  try {
    const data = await redis.hget(key, field);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log(`Lỗi khi lấy cache với ${key}: ${error}`);
    return null;
  }
};

export const getCartCache = async (
  key: string,
): Promise<CartResponseDto[] | null> => {
  try {
    const cart = await redis.hgetall(key);
    if (!Object.values(cart).length) {
      return null;
    }
    return Object.values(cart)
      .map((c) => JSON.parse(c))
      .sort((a, b) => a.addedAt - b.addedAt);
  } catch (error) {
    console.log(`Lỗi khi lấy cache với ${key}: ${error}`);
    return null;
  }
};

export const setCartItemCache = async (
  key: string,
  field: string,
  value: any,
  ttl: number,
): Promise<void> => {
  try {
    const data = JSON.stringify(value);
    await redis.multi().hset(key, field, data).expire(key, ttl).exec();
  } catch (error) {
    console.log(`Lỗi khi lưu cache với ${key}: ${error}`);
  }
};

export const setCartCache = async (
  key: string,
  cart: CartResponseDto[],
  ttl: number,
): Promise<void> => {
  try {
    const hashCart: Record<string, string> = {};

    for (const c of cart) {
      const field = c.variant?.id ?? c.product.id;
      hashCart[field] = JSON.stringify(c);
    }

    await redis.multi().hset(key, hashCart).expire(key, ttl).exec();
  } catch (error) {
    console.log(`Lỗi khi lưu cache với ${key}: ${error}`);
  }
};
