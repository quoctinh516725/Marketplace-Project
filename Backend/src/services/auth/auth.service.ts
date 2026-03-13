import userRepository from "../../repositories/user.repository";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../error/AppError";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenRemainingTime,
  verifyAccessToken,
} from "../../utils/jwt";
import { UserRole, UserStatus } from "../../constants";
import jwt, { JwtPayload } from "jsonwebtoken";
import refreshTokenRepository from "../../repositories/refreshToken.repository";
import { prisma } from "../../config/prisma";
import {
  addAuthUserCache,
  addBlacklistToken,
  deleteAuthUserCache,
} from "./auth.cache";
import userService from "../user/user.service";
import roleService from "../role/role.service";
import roleRepository from "../../repositories/role.repository";
import permissionRepository from "../../repositories/permission.repository";
import shopRepository from "../../repositories/shop.repository";
import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  RefreshTokenResponseDto,
  UserInfoDto,
} from "../../dtos";
import cartService from "../cart/cart.service";
import notificationService from "../notification/notification.service";

class AuthService {
  login = async (
    data: LoginRequestDto,
    guestId?: string,
  ): Promise<LoginResponseDto> => {
    const { emailOrUsername, password } = data;
    // Check exist

    const user = await userRepository.existEmailOrUsername(emailOrUsername);

    if (!user)
      throw new UnauthorizedError("Email hoặc Username không tồn tại!");
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError("Tài khoản đã bị vô hiệu hóa!");
    }

    // Compare Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError("Password không hợp lệ!");

    //Get roles and permission for generate token
    const { roleCodes, roleIds } = await roleRepository.findRolesByUser(
      user.id,
    );
    if (!roleCodes || roleCodes.length === 0)
      throw new NotFoundError("Không tồn tại chức năng của người dùng!");

    //Permission default with role
    const rolePermission =
      await permissionRepository.getPermissionsByRole(roleIds);

    //Permission own User
    const userPermission = await permissionRepository.getPermissionsByUser(
      user.id,
    );

    const permissions = [...new Set([...rolePermission, ...userPermission])];
    if (permissions.length === 0) {
      throw new ForbiddenError("Tài khoản chưa được cấp quyền!");
    }

    //Get shop
    const shop = await shopRepository.findShopBySeller(user.id);

    //Get accessToken
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      shopId: shop?.id,
    });

    //Get ttl for Add Cache
    const ttl = getTokenRemainingTime(accessToken);

    // Add cache
    await addAuthUserCache(
      {
        id: user.id,
        status: user.status as UserStatus,
        roles: roleCodes,
        permissions,
        shopId: shop?.id,
      },
      ttl,
    );

    //Get refresh token
    const refreshToken = generateRefreshToken(user.id);

    //Get expiredAt for Create refreshToken
    const decoded = jwt.decode(refreshToken) as JwtPayload;
    if (!decoded || !decoded.exp) {
      throw new ValidationError("Không thể decode refresh token!");
    }
    const expiredAt = new Date(decoded.exp * 1000);

    await prisma.$transaction(async (tx) => {
      // Update lastLoginAt
      await userRepository.update(tx, user.id, { lastLoginAt: new Date() });

      // Revoke All RefreshToken
      await refreshTokenRepository.revokeAllRefreshToken(tx, user.id);

      //Create refresh token DB
      await refreshTokenRepository.create(tx, {
        userId: user.id,
        token: refreshToken,
        expiredAt,
      });
    });

    // Sync Cart
    if (guestId) {
      await cartService.mergeGuestCartToUserCart(guestId, user.id);
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  };
  register = async (
    data: RegisterRequestDto,
    guestId?: string,
  ): Promise<RegisterResponseDto> => {
    const { email, username, password } = data;

    //Check exist email
    const existEmail = await userRepository.existEmail(email);
    if (existEmail) {
      throw new ConflictError("Email đã tồn tại!");
    }

    //Check username
    const existUsername = await userRepository.existUsername(username);
    if (existUsername) {
      throw new ConflictError("Username đã tồn tại!");
    }

    //Hash Password
    const salt = 10;
    const password_hash = await bcrypt.hash(password, salt);

    //Check Role
    const roleCode = UserRole.USER; // Khởi tạo Role là User
    const role = await roleRepository.findRoleByCode(roleCode);
    if (!role) throw new ValidationError("Chức năng không tồn tại!");

    //Get permission
    const permissions = await permissionRepository.getPermissionsByRole([
      role.id,
    ]);

    if (permissions.length === 0) {
      throw new ForbiddenError("Tài khoản chưa được cấp quyền!");
    }

    const result = await prisma.$transaction(async (tx) => {
      //Create User
      const newUser = await userRepository.create(tx, {
        ...data,
        password: password_hash,
      });

      //Gán role
      await roleService.assignRoleToUser(tx, newUser.id, [roleCode], false);

      //Sinh Refresh Token
      const refreshToken = generateRefreshToken(newUser.id);
      const decoded = jwt.decode(refreshToken) as JwtPayload;
      if (!decoded || !decoded.exp) {
        throw new ValidationError("Không thể decode refresh token!");
      }
      const expiredAt = new Date(decoded.exp * 1000);

      //Lưu Refresh Token vào DB
      await refreshTokenRepository.create(tx, {
        userId: newUser.id,
        token: refreshToken,
        expiredAt,
      });
      return {
        newUser,
        refreshToken,
      };
    });

    //Sinh Access Token
    const accessToken = generateAccessToken({
      userId: result.newUser.id,
      email,
      username,
      shopId: undefined,
    });

    //Cache thông tin user
    const ttl = getTokenRemainingTime(accessToken);
    const user = result.newUser;

    await addAuthUserCache(
      {
        id: user.id,
        status: user.status as UserStatus,
        roles: [roleCode],
        permissions,
        shopId: undefined,
      },
      ttl,
    );

    // Sync Cart
    if (guestId) {
      await cartService.mergeGuestCartToUserCart(guestId, user.id);
    }

    // Send Notification
    await notificationService.createNotification(
      user.id,
      "Chào mừng bạn đến với Marketplace!",
      "Tài khoản của bạn đã được tạo thành công. Chúc bạn có những trải nghiệm mua sắm tuyệt vời!",
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        status: user.status,
      } as UserInfoDto,
      accessToken,
      refreshToken: result.refreshToken,
    };
  };
  refreshToken = async (
    refreshToken: string,
  ): Promise<RefreshTokenResponseDto> => {
    //Check revoked
    const refreshTokenFind =
      await refreshTokenRepository.findByToken(refreshToken);

    if (!refreshTokenFind || refreshTokenFind.revoked) {
      throw new UnauthorizedError(
        "RefreshToken không hợp lệ hoặc đã bị thu hồi!",
      );
    }

    //Check exp
    if (refreshTokenFind.expiredAt < new Date()) {
      throw new UnauthorizedError("RefreshToken đã hết hạn!");
    }

    //Check User valid
    const user = refreshTokenFind.user;
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("Tài khoản không hoạt động!");
    }

    //Get roles for token
    const { roleCodes, roleIds } = await roleRepository.findRolesByUser(
      user.id,
    );
    if (!roleCodes || roleCodes.length === 0)
      throw new NotFoundError("Không tồn tại chức năng của người dùng!");

    //Permission default with role
    const rolePermission =
      await permissionRepository.getPermissionsByRole(roleIds);

    //Permission own User
    const userPermission = await permissionRepository.getPermissionsByUser(
      user.id,
    );

    const permissions = [...new Set([...rolePermission, ...userPermission])];
    if (permissions.length === 0) {
      throw new ForbiddenError("Tài khoản chưa được cấp quyền!");
    }

    //Get shop
    const shop = await shopRepository.findShopBySeller(user.id);

    //Get accessToken
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      shopId: shop?.id,
    });

    const ttl = getTokenRemainingTime(accessToken);

    //Update userCache
    await addAuthUserCache(
      {
        id: user.id,
        status: user.status as UserStatus,
        roles: roleCodes,
        permissions,
        shopId: shop?.id,
      },
      ttl,
    );
    return { accessToken };
  };
  logout = async (
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> => {
    // Add Blacklist token
    const ttl = getTokenRemainingTime(accessToken);
    const decoded = verifyAccessToken(accessToken);
    const jti = decoded.jti!;
    if (ttl > 0) {
      await addBlacklistToken(jti, ttl);
    }

    // Delete UserCache
    await deleteAuthUserCache(userId);

    // Revoke RefreshToken
    await refreshTokenRepository.revokeRefreshToken(refreshToken);
  };
}

export default new AuthService();
