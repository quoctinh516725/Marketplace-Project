import { prisma } from "../../config/prisma";
import { NotFoundError } from "../../error/AppError";
import userRepository, {
  UpdateUserData,
} from "../../repositories/user.repository";
import userRoleRepository from "../../repositories/userRole.repository";
import { UserResponse, UserUpdateResponse } from "../../types/user";

class UserService {
  getMe = async (userId: string): Promise<UserResponse> => {
    const [user, roles] = await Promise.all([
      await userRepository.findById(userId),
      await userRoleRepository.findRolesByUser(userId),
    ]);

    if (!user) throw new NotFoundError("Người dùng không tồn tại!");
    const { password, ...userResponse } = user;
    return { ...userResponse, roles };
  };
  update = async (
    userId: string,
    data: UpdateUserData,
  ): Promise<UserUpdateResponse> => {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    const updated = await userRepository.update(prisma, userId, data);
    return {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      fullName: updated.fullName,
      phone: updated.phone,
      gender: updated.gender,
      dateOfBirth: updated.dateOfBirth,
      avatarUrl: updated.avatarUrl,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  };
  updateAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
    await userRepository.updateAvatar(userId, avatarUrl);
  };
}
export default new UserService();
