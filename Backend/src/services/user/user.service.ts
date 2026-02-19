import { Request } from "express";
import { prisma } from "../../config/prisma";
import { UserRole, UserStatus } from "../../constants";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import userRepository, {
  UpdateUserData,
} from "../../repositories/user.repository";
import { InputAll } from "../../types";
import { DecodedToken } from "../../utils/jwt";
import { cacheAsync } from "../../utils/cache";
import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import { deleteUserCache } from "./user.cache";
import {
  UserListResponseDto,
  UserDetailResponseDto,
  UserProfileResponseDto,
  UserBasicResponseDto,
} from "../../dtos/user/user.response.dto";
import {
  toUserProfileResponse,
  toUserDetailResponse,
  toUserBasicResponse,
} from "../../dtos/user/mapper.dto";
import { deleteAuthUserCache } from "../auth/auth.cache";
import { UserUpdateRequest } from "../../dtos/user/user.request.dto";

class UserService {
  getMe = async (userId: string): Promise<UserDetailResponseDto> => {
    return cacheAsync(
      CacheKey.user.me(userId),
      CacheTTL.me.detail,
      [`user:${userId}`],
      async () => {
        const user = await userRepository.findUserDetailById(prisma, userId);
        if (!user) throw new NotFoundError("Người dùng không tồn tại!");

        const data = toUserDetailResponse(user);
        return {
          data,
          tags: data.roles.map((r) => `role:${r}`),
        };
      },
    );
  };
  getUsers = async (input: InputAll): Promise<UserListResponseDto> => {
    const { page, limit, status, search } = input;

    //Validate status
    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
      throw new ValidationError("Trạng thái không hợp lệ!");
    }

    return cacheAsync(
      CacheKey.user.list({ status, page, limit, search }),
      CacheTTL.me.list,
      [`user:list`],
      async () => {
        const users = await userRepository.getUsers({
          status,
          search,
          page,
          limit,
        });

        const data = {
          data: users.data.map((user) => toUserBasicResponse(user)),
          pagination: {
            page,
            limit,
            total: users.total,
          },
        };

        return { data };
      },
    );
  };

  getProfile = async (userId: string): Promise<UserProfileResponseDto> => {
    return cacheAsync(
      CacheKey.user.profile(userId),
      CacheTTL.me.profile,
      [`user:${userId}`],
      async () => {
        const user = await userRepository.getProfile(userId);
        if (!user) throw new NotFoundError("Người dùng không tồn tại!");

        const roles = user.userRoles.map((r) => `role:${r.role.code}`);
        const data = toUserProfileResponse(user);
        return {
          data,
          tags: roles,
        };
      },
    );
  };

  getUserById = async (userId: string): Promise<UserDetailResponseDto> => {
    const user = await userRepository.findUserDetailById(prisma, userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    const data = toUserDetailResponse(user);
    return data;
  };

  update = async (
    userId: string,
    data: UserUpdateRequest,
  ): Promise<UserBasicResponseDto> => {
    const user = await userRepository.findUserDetailById(prisma, userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    const result = await userRepository.update(prisma, userId, data);

    const userUpdated = toUserBasicResponse(result);

    await deleteUserCache(userUpdated.id);
    return userUpdated;
  };
  updateUserStatus = async (
    userId: string,
    currentUser: DecodedToken,
    status: UserStatus,
  ): Promise<UserBasicResponseDto> => {
    const user = await userRepository.findUserDetailById(prisma, userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    const isAdmin = user.userRoles.some(
      (ur) => ur.role.code === UserRole.ADMIN,
    );
    if (isAdmin && !currentUser.roles?.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Không có quyền cập nhật trạng thái  Admin!");
    }

    const result = await userRepository.update(prisma, userId, { status });
    const userUpdated = toUserBasicResponse(result);

    await Promise.all([
      deleteAuthUserCache(userUpdated.id),
      deleteUserCache(userUpdated.id),
    ]);
    return userUpdated;
  };
  delete = async (
    id: string,
    currentUser: DecodedToken,
  ): Promise<UserBasicResponseDto> => {
    const user = await userRepository.findUserDetailById(prisma, id);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");
    if (user.deletedAt) throw new ConflictError("Người dùng đã bị xóa!");

    //Chỉ ADMIN mới xóa được ADMIN
    const isAdmin = user.userRoles.some(
      (ur) => ur.role.code === UserRole.ADMIN,
    );
    if (isAdmin && !currentUser.roles?.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Không có quyền xóa Admin!");
    }

    const result = await userRepository.update(prisma, user.id, {
      status: UserStatus.DELETED,
      deletedAt: new Date(),
    });

    const userDeleted = toUserBasicResponse(result);
    await Promise.all([
      deleteAuthUserCache(userDeleted.id),
      deleteUserCache(userDeleted.id),
    ]);

    return userDeleted;
  };
  updateAvatar = async (
    userId: string,
    avatarUrl: string,
  ): Promise<UserBasicResponseDto> => {
    const user = await userRepository.findUserDetailById(prisma, userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");
    const result = await userRepository.updateAvatar(userId, avatarUrl);
    const userUpdated = toUserBasicResponse(result);

    await deleteUserCache(userUpdated.id);
    return userUpdated;
  };
}
export default new UserService();
