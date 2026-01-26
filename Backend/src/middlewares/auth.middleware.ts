import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ForbiddenError, UnauthorizedError } from "../error/AppError";
import { isBlacklistToken } from "../services/auth/auth.cache";
import { DecodedToken, verifyAccessToken } from "../utils/jwt";
import { getUserCache } from "../services/user/user.cache";
import { UserRole, UserStatus } from "../constants";

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

    //Check User Active
    const userCache = await getUserCache(decoded.userId);
    if (!userCache) {
      throw new UnauthorizedError(
        "Phiên hoạt động không tồn tại hoặc hết hạn!",
      );
    }

    if (userCache.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("Tài khoản đã bị vô hiệu hóa!");
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
