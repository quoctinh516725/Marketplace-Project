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
import {
  UserAllResponse,
  UserInforResponse,
  UserProfileResponse,
  UserResponse,
  UserUpdateResponse,
} from "../../types/user.type";
import { DecodedToken } from "../../utils/jwt";
import { cacheAsync } from "../../utils/cache";
import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import { deleteUserCache } from "./user.cache";
import roleRepository from "../../repositories/role.repository";

class UserService {
  getMe = async (userId: string): Promise<UserInforResponse> => {
    return cacheAsync(
      CacheKey.user.detail(userId),
      CacheTTL.me.detail,
      [`user:${userId}`],
      async () => {
        const [user, roles] = await Promise.all([
          userRepository.findById(prisma, userId),
          roleRepository.findRolesByUser(userId),
        ]);

        if (!user) throw new NotFoundError("Người dùng không tồn tại!");
        if (roles.length === 0)
          throw new NotFoundError("Không tồn tại chức năng của người dùng!");
        return {
          data: { ...user, roles },
          tags: roles.map((r) => `role:${r}`),
        };
      },
    );
  };
  getUsers = async (input: InputAll): Promise<UserAllResponse> => {
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
        const data = await userRepository.getUsers({
          status,
          search,
          page,
          limit,
        });
        return { data };
      },
    );
  };
  getProfile = async (userId: string): Promise<UserProfileResponse> => {
    return cacheAsync(
      CacheKey.user.profile(userId),
      CacheTTL.me.profile,
      [`user:${userId}`],
      async () => {
        const user = await userRepository.getProfile(userId);
        if (!user) throw new NotFoundError("Người dùng không tồn tại!");

        return {
          data: user.profile,
          tags: user.roleCodes.map((r) => `role:${r}`),
        };
      },
    );
  };
  getUserById = async (userId: string): Promise<UserInforResponse> => {
    const [user, roles] = await Promise.all([
      userRepository.findById(prisma, userId),
      roleRepository.findRolesByUser(userId),
    ]);

    if (!user) throw new NotFoundError("Người dùng không tồn tại!");
    if (roles.length === 0)
      throw new NotFoundError("Không tồn tại chức năng của người dùng!");
    return { ...user, roles };
  };

  update = async (
    userId: string,
    data: UpdateUserData,
  ): Promise<UserUpdateResponse> => {
    const userUpdated = await userRepository.update(prisma, userId, data);
    if (!userUpdated) throw new NotFoundError("Người dùng không tồn tại!");

    await deleteUserCache(userUpdated.id);
    return userUpdated;
  };
  delete = async (
    id: string,
    currentUser: DecodedToken,
  ): Promise<UserUpdateResponse> => {
    const user = await userRepository.findById(prisma, id);
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
    await deleteUserCache(user.id);
    return result!;
  };
  updateAvatar = async (
    userId: string,
    avatarUrl: string,
  ): Promise<UserUpdateResponse> => {
    const result = await userRepository.updateAvatar(userId, avatarUrl);
    if (!result) throw new NotFoundError("Người dùng không tồn tại!");
    await deleteUserCache(userId);
    return result;
  };
}
export default new UserService();
