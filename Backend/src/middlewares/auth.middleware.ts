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
import { prisma } from "../config/prisma";
import { PermissionCode } from "../constants/permissionCode";
import permissionRepository from "../repositories/permission.repository";
import shopRepository from "../repositories/shop.repository";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      token?: string;
      roles?: string[];
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
      const user = await userRepository.findUserDetailById(prisma, decoded.userId);

      if (!user) throw new UnauthorizedError("Tài khoản không tồn tại!");

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError("Tài khoản đã bị vô hiệu hóa!");
      }

      const roleCodes = user.userRoles.map((ur) => ur.role.code);
      const roleIds = user.userRoles.map((ur) => ur.role.id);

      const rolePermissions =
        await permissionRepository.getPermissionsByRole(roleIds);
      const userPermissions = user.userPermissions.map(
        (up) => up.permission.code,
      );

      const permissions = [
        ...new Set([...rolePermissions, ...userPermissions]),
      ];

      //Get shop
      let shopId: string | undefined;
      if (roleCodes.includes(UserRole.SELLER)) {
        const shop = await shopRepository.findShopBySeller(user.id);
        shopId = shop?.id;
      }

      userCache = {
        id: user.id,
        status: user.status,
        roles: roleCodes,
        permissions,
        shopId,
      };

      const ttl = getTokenRemainingTime(token);
      await addAuthUserCache(userCache, ttl);
    }

    // Gán role và shopId mới nhất trong trường hợp người dùng đăng ký shop hoặc admin chỉnh sửa role trong phiên hoạt động
    decoded.roles = userCache.roles;
    decoded.permissions = userCache.permissions;
    decoded.shopId = userCache.shopId ?? undefined;

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

export const requirePermission = (permissionCodes: PermissionCode[]) =>
  asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new UnauthorizedError("Vui lòng đăng nhập tài khoản!");
      }

      const permissions = req.user.permissions ?? [];

      //Pypass Admin
      if (req.user.roles!.includes(UserRole.ADMIN)) return next();

      //Check role
      for (const p of permissionCodes) {
        if (permissions.includes(p)) return next();
      }
      throw new ForbiddenError("Không có quyền truy cập!");
    },
  );
