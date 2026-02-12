import { Role } from "../../../generated/prisma/client";
import cacheTag from "../../cache/cache.tag";
import { prisma } from "../../config/prisma";
import { UserRole } from "../../constants";
import { RoleStatus } from "../../constants/roleStatus";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import roleRepository, {
  CreateRole,
  UpdateRole,
} from "../../repositories/role.repository";
import userRepository from "../../repositories/user.repository";
import { PrismaType } from "../../types";

class RoleService {
  create = async (data: CreateRole): Promise<Role> => {
    //Check role exist
    const exist = await roleRepository.findRoleByCode(data.code);
    if (exist) throw new ConflictError("Chức năng đã tồn tại!");
    return await roleRepository.create(data);
  };
  getAllRoles = async (): Promise<Role[]> => {
    return await roleRepository.getAllRoles();
  };
  updateRole = async (id: string, data: UpdateRole): Promise<Role> => {
    const role = await roleRepository.findRoleById(id);
    if (!role) throw new NotFoundError("Chức năng không tồn tại!");

    //Check status
    if (data.status && !Object.values(RoleStatus).includes(data.status)) {
      throw new ValidationError("Trạng thái chức năng không hợp lệ!");
    }
    const result = await roleRepository.updateRole(id, data);
    await cacheTag.invalidateTag(`role:${result.code}`);

    return result;
  };
  delete = async (id: string): Promise<Role> => {
    const role = await roleRepository.findRoleById(id);
    if (!role) throw new NotFoundError("Chức năng không tồn tại!");

    const result = await roleRepository.delete(id);
    await cacheTag.invalidateTag(`role:${result.code}`);
    return result;
  };
  assignRoleToUser = async (
    client: PrismaType,
    id: string,
    roleCodes: UserRole[],
    isInvalidateTag: boolean = true,
  ): Promise<void> => {
    const user = await userRepository.findById(client, id);

    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    if (!roleCodes || roleCodes.length === 0)
      throw new ValidationError("Không có chức năng nào được chọn!");

    const roles = await roleRepository.validateRoles(client, roleCodes);
    if (!roles) throw new NotFoundError("Chức năng được gán không hợp lệ!");

    await roleRepository.assignRoleToUser(
      client,
      id,
      roles.map((role) => role.id),
    );
    if (isInvalidateTag) {
      await Promise.all([
        cacheTag.invalidateTag(`auth:user:${id}`),
        cacheTag.invalidateTag(`user:${id}`),
      ]);
    }
  };
  revokeRoleFromUser = async (
    id: string,
    roleCodes: UserRole[],
  ): Promise<void> => {
    const user = await userRepository.findById(prisma, id);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    if (!roleCodes || roleCodes.length === 0)
      throw new ValidationError("Không có chức năng nào được chọn!");

    const roles = await roleRepository.validateRoles(prisma, roleCodes);
    if (!roles) throw new NotFoundError("Chức năng được gán không hợp lệ!");

    await roleRepository.revokeRoleFromUser(
      prisma,
      id,
      roles.map((role) => role.id),
    );
    await Promise.all([
      cacheTag.invalidateTag(`auth:user:${id}`),
      cacheTag.invalidateTag(`user:${id}`),
    ]);
  };
}
export default new RoleService();
