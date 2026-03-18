import { prisma } from "../../config/prisma";
import { UserRole, UserStatus } from "../../constants";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import userRepository from "../../repositories/user.repository";
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
import {
  CreateUserAddressRequest,
  UpdateUserAddressRequest,
  UserUpdateRequest,
} from "../../dtos/user/user.request.dto";

class UserService {
  getMe = async (userId: string): Promise<UserDetailResponseDto> => {
    return cacheAsync(
      CacheKey.user.me(userId),
      CacheTTL.me.detail,
      [`user:${userId}`],
      async () => {
        const user = await userRepository.findUserDetailById(prisma, userId);
        if (!user) throw new NotFoundError("Nguoi dung khong ton tai!");

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

    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
      throw new ValidationError("Trang thai khong hop le!");
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
        if (!user) throw new NotFoundError("Nguoi dung khong ton tai!");

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
    if (!user) throw new NotFoundError("Nguoi dung khong ton tai!");

    return toUserDetailResponse(user);
  };

  update = async (
    userId: string,
    data: UserUpdateRequest,
  ): Promise<UserBasicResponseDto> => {
    const user = await userRepository.findUserDetailById(prisma, userId);
    if (!user) throw new NotFoundError("Nguoi dung khong ton tai!");

    const result = await userRepository.update(prisma, userId, data);

    const userUpdated = toUserBasicResponse(result);
    await deleteUserCache(userUpdated.id);
    return userUpdated;
  };

  createUserAddress = async (
    userId: string,
    data: CreateUserAddressRequest,
  ) => {
    const user = await userRepository.findUserDetailById(prisma, userId);
    if (!user) throw new NotFoundError("Nguoi dung khong ton tai!");

    return await userRepository.createUserAddress(prisma, { ...data, userId });
  };

  updateUserAddress = async (
    userId: string,
    addressId: string,
    data: UpdateUserAddressRequest,
  ) => {
    const address = await userRepository.findUserAddressByAddressId(
      prisma,
      addressId,
    );
    if (!address) throw new NotFoundError("Dia chi khong ton tai!");

    if (address.userId !== userId) {
      throw new ForbiddenError("Khong co quyen cap nhat dia chi nay!");
    }

    return await userRepository.updateUserAddress(prisma, addressId, data);
  };

  deleteUserAddress = async (userId: string, addressId: string) => {
    const address = await userRepository.findUserAddressByAddressId(
      prisma,
      addressId,
    );
    if (!address) throw new NotFoundError("Dia chi khong ton tai!");
    if (address.userId !== userId) {
      throw new ForbiddenError("Khong co quyen cap nhat dia chi nay!");
    }

    if (!address) throw new NotFoundError("Dia chi khong ton tai!");

    return await userRepository.deleteUserAddress(prisma, addressId);
  };

  updateUserStatus = async (
    userId: string,
    currentUser: DecodedToken,
    status: UserStatus,
  ): Promise<UserBasicResponseDto> => {
    const user = await userRepository.findUserDetailById(prisma, userId);
    if (!user) throw new NotFoundError("Nguoi dung khong ton tai!");

    const isAdmin = user.userRoles.some(
      (ur) => ur.role.code === UserRole.ADMIN,
    );
    if (isAdmin && !currentUser.roles?.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Khong co quyen cap nhat trang thai Admin!");
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
    if (!user) throw new NotFoundError("Nguoi dung khong ton tai!");
    if (user.deletedAt) throw new ConflictError("Nguoi dung da bi xoa!");

    const isAdmin = user.userRoles.some(
      (ur) => ur.role.code === UserRole.ADMIN,
    );
    if (isAdmin && !currentUser.roles?.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Khong co quyen xoa Admin!");
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
    if (!user) throw new NotFoundError("Nguoi dung khong ton tai!");
    const result = await userRepository.updateAvatar(userId, avatarUrl);
    const userUpdated = toUserBasicResponse(result);

    await deleteUserCache(userUpdated.id);
    return userUpdated;
  };
}

export default new UserService();
