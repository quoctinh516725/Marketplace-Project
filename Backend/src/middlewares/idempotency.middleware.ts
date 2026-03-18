import { Request, Response } from "express";
import { ValidationError } from "../error/AppError";
import redis from "../config/redis";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";
import { CacheKey } from "../cache/cache.key";
import idempotencyKeyRepository from "../repositories/idempotencyKey.repository";
import { IdempotencyKeyStatus } from "../constants/idempotencyKeyStatus";
import crypto from "crypto";

export const deleteLock = async (key: string, value: string) => {
  const script = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
  `;

  await redis.eval(script, 1, key, value);
};

export const idempotencyMiddleware = asyncHandler(
  async (req: Request, res: Response, next: Function) => {
    const key = req.header("Idempotency-Key");
    if (!key) {
      throw new ValidationError("Idempotency-Key header is required!");
    }

    const userId = req.user?.userId!;
    const requestHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(req.body))
      .digest("hex");

    const keyCache = await redis.get(CacheKey.idempotency.key(key, userId));
    if (keyCache) {
      if (JSON.parse(keyCache).requestHash !== requestHash) {
        throw new ValidationError("Yêu cầu không khớp với yêu cầu trước đó!");
      }

      const response = JSON.parse(keyCache);
      return sendSuccess(res, response.data, "Yêu cầu đã được xử lý trước đó!");
    }

    const lockKey = `lock:${key}:${userId}`;
    const lockValue = crypto.randomUUID();
    const acquired = await redis.set(lockKey, lockValue, "EX", 60, "NX");

    if (!acquired) {
      throw new ValidationError(
        "Yêu cầu đang được xử lý, vui lòng thử lại sau!",
      );
    }

    try {
      const existingKey = await idempotencyKeyRepository.findKey(key, userId);
      if (existingKey) {
        if (existingKey.requestHash !== requestHash) {
          throw new ValidationError("Yêu cầu không khớp với yêu cầu trước đó!");
        }

        if (existingKey.status === IdempotencyKeyStatus.PROCESSING) {
          throw new ValidationError("Yêu cầu đang xử lý");
        }

        if (existingKey.status === IdempotencyKeyStatus.SUCCESS) {
          return sendSuccess(
            res,
            JSON.parse(existingKey.response!).data,
            "Đã xử lý trước đó",
          );
        }

        if (existingKey.status === IdempotencyKeyStatus.FAILED) {
          await idempotencyKeyRepository.updateStatus(
            key,
            userId,
            IdempotencyKeyStatus.PROCESSING,
          );
        }
      } else {
        await idempotencyKeyRepository.create({
          key,
          userId,
          requestHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //Cron sau 24 giờ
        });
      }

      req.idempotencyKey = { key, lockValue, lockKey, requestHash };
      next();
    } catch (error) {
      await deleteLock(lockKey, lockValue); // Đảm bảo xóa lock nếu có lỗi xảy ra
      throw new ValidationError(
        "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại!",
      );
    }
  },
);
