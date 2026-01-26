import { UserRole } from "../../constants";
import { NotFoundError, ValidationError } from "../../error/AppError";
import roleRepository from "../../repositories/role.repository";
import userRepository from "../../repositories/user.repository";

class RoleService {
  asignRoleToUser = async (
    id: string,
    roleCodes: UserRole[],
  ): Promise<void> => {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    if (!roleCodes || roleCodes.length === 0)
      throw new ValidationError("Không có chức năng nào được chọn!");

    const roles = await roleRepository.validateRoles(roleCodes);
    if (!roles) throw new NotFoundError("Chức năng được gán không hợp lệ!");

    await roleRepository.asignRoleToUser(
      id,
      roles.map((role) => role.id),
    );
  };
}
export default new RoleService();
