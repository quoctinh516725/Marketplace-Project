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
import userRoleRepository from "../../repositories/userRole.repository";
import { getAllInput } from "../../types";
import {
  UserAllResponse,
  UserInforResponse,
  UserProfileResponse,
  UserUpdateResponse,
} from "../../types/user.type";
import { DecodedToken } from "../../utils/jwt";

class UserService {
  getMe = async (userId: string): Promise<UserInforResponse> => {
    const [user, roles] = await Promise.all([
      userRepository.findById(userId),
      userRoleRepository.findRolesByUser(userId),
    ]);

    if (!user) throw new NotFoundError("Người dùng không tồn tại!");
    const { password, ...userResponse } = user;
    return { ...userResponse, roles };
  };
  getUsers = async (input: getAllInput): Promise<UserAllResponse> => {
    const { status, page, limit, search } = input;

    //Validate status
    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
      throw new ValidationError("Trạng thái không hợp lệ!");
    }

    return await userRepository.getUsers({ status, search, page, limit });
  };
  getUserById = async (userId: string): Promise<UserInforResponse> => {
    const [user, roles] = await Promise.all([
      userRepository.findById(userId),
      userRoleRepository.findRolesByUser(userId),
    ]);

    if (!user) throw new NotFoundError("Người dùng không tồn tại!");
    const { password, ...userResponse } = user;
    return { ...userResponse, roles };
  };
  getProfile = async (userId: string): Promise<UserProfileResponse | null> => {
    const user = await userRepository.getProfile(userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    return user;
  };

  update = async (
    userId: string,
    data: UpdateUserData,
  ): Promise<UserUpdateResponse> => {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    const userUpdated = await userRepository.update(prisma, userId, data);
    return userUpdated;
  };
  delete = async (id: string, currentUser: DecodedToken): Promise<void> => {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");
    if (user.deletedAt) throw new ConflictError("Người dùng đã bị xóa!");

    //Chỉ ADMIN mới xóa được ADMIN
    const isAdmin = user.userRoles.some(
      (ur) => ur.role.code === UserRole.ADMIN,
    );
    if (isAdmin && !currentUser.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Không có quyền xóa Admin!");
    }

    await userRepository.update(prisma, user.id, {
      status: UserStatus.DELETED,
      deletedAt: new Date(),
    });
  };
  updateAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
    await userRepository.updateAvatar(userId, avatarUrl);
  };
}
export default new UserService();
