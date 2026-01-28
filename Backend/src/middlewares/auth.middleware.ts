import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ForbiddenError, UnauthorizedError } from "../error/AppError";
import {
  addAuthUserCache,
  getAuthUserCache,
  isBlacklistToken,
} from "../services/auth/auth.cache";
import {
  DecodedToken,
  getTokenRemainingTime,
  verifyAccessToken,
} from "../utils/jwt";
import { UserRole, UserStatus } from "../constants";
import userRepository from "../repositories/user.repository";
import { CacheKey } from "../cache/cache.key";
import { CacheTTL } from "../cache/cache.ttl";
import { prisma } from "../config/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      token?: string;
    }
  }
}
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeaders = req.headers.authorization;

    //Check token valid
    const token = authHeaders?.startsWith("Bearer ")
      ? authHeaders.split(" ")[1]
      : undefined;
    if (!token) {
      throw new UnauthorizedError("Vui lòng đăng nhập để thực hiện tác vụ!");
    }

    //Check Blacklist token
    const decoded = verifyAccessToken(token);
    const isBlacklist = await isBlacklistToken(decoded.jti as string);
    if (isBlacklist) {
      throw new UnauthorizedError("Token đã bị vô hiệu!");
    }

    //Get cache check User Active
    let userCache = await getAuthUserCache(decoded.userId);
    if (!userCache) {
      const user = await userRepository.findById(prisma, decoded.userId);

      if (!user) throw new UnauthorizedError("Tài khoản không tồn tại!");

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError("Tài khoản đã bị vô hiệu hóa!");
      }
      const roles = user.userRoles.map((ur) => ur.role.code);

      userCache = {
        id: user.id,
        status: user.status,
        roles,
      };

      const ttl = getTokenRemainingTime(token);
      await addAuthUserCache(userCache, ttl);
    }

    // Gán role và shopId mới nhất trong trường hợp người dùng đăng ký shop hoặc admin chỉnh sửa role trong phiên hoạt động
    // NOTE: BỔ SUNG SHOP SAU
    decoded.roles = userCache.roles;

    req.user = decoded;
    req.token = token;
    next();
  },
);

export const requireRole = (roleCodes: UserRole[]) =>
  asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new UnauthorizedError("Vui lòng đăng nhập tài khoản!");
      }

      const roles = req.user.roles ?? [];

      //Pypass Admin
      if (roles.includes(UserRole.ADMIN)) return next();

      //Check role
      for (const r of roleCodes) {
        if (roles.includes(r as UserRole)) return next();
      }
      throw new ForbiddenError("Không có quyền truy cập!");
    },
  );
