import { Permission } from "../../../generated/prisma/client";
import cacheTag from "../../cache/cache.tag";
import { prisma } from "../../config/prisma";
import { PermissionStatus } from "../../constants/permissionStatus";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import permissionRepository, {
  CreatePermission,
  PermissionAllResponse,
  UpdatePermission,
} from "../../repositories/permission.repository";
import roleRepository from "../../repositories/role.repository";
import userRepository from "../../repositories/user.repository";
import { InputAll } from "../../types";

class PermissionService {
  create = async (data: CreatePermission): Promise<Permission> => {
    //Check role exist
    const exist = await permissionRepository.findByCode(data.code);
    if (exist) throw new ConflictError("Quyền hạn đã tồn tại!");

    return await permissionRepository.create(data);
  };
  getAll = async (input: InputAll): Promise<PermissionAllResponse> => {
    const { status, page, limit, search } = input;

    //Validate status
    if (
      status &&
      !Object.values(PermissionStatus).includes(status as PermissionStatus)
    ) {
      throw new ValidationError("Trạng thái không hợp lệ!");
    }

    return await permissionRepository.getAll({
      status,
      search,
      page,
      limit,
    });
  };
  update = async (id: string, data: UpdatePermission): Promise<Permission> => {
    const permission = await permissionRepository.findById(id);
    if (!permission) throw new NotFoundError("Quyền không tồn tại!");
    if (data.code) {
      const exist = await permissionRepository.findByCode(data.code);
      if (exist && exist.id !== id)
        throw new ConflictError("Quyền hạn đã tồn tại!");
    }
    if (data.status && !Object.values(PermissionStatus).includes(data.status)) {
      throw new ValidationError("Trạng thái quyền không hợp lệ!");
    }

    const { roleCodes } = await roleRepository.findRolesByPermissionId(id);

    //Invalidate Tag
    const result = await permissionRepository.update(id, data);

    if (roleCodes.length > 0) {
      await Promise.all(
        roleCodes.map((roleCode) => cacheTag.invalidateTag(`role:${roleCode}`)),
      );
    }

    return result;
  };
  delete = async (id: string): Promise<Permission> => {
    const permission = await permissionRepository.findById(id);
    if (!permission) throw new NotFoundError("Quyền không tồn tại!");

    const { roleCodes } = await roleRepository.findRolesByPermissionId(id);

    const result = await permissionRepository.delete(id);
    if (roleCodes.length > 0) {
      await Promise.all(
        roleCodes.map((roleCode) => cacheTag.invalidateTag(`role:${roleCode}`)),
      );
    }
    return result;
  };
  assignPermissionToRole = async (
    roleId: string,
    permissionCodes: string[],
  ): Promise<void> => {
    const role = await roleRepository.findRoleById(roleId);
    if (!role) throw new NotFoundError("Chức năng không hợp lệ!");

    if (!permissionCodes || permissionCodes.length === 0)
      throw new ValidationError("Không có quyền nào được chọn!");

    const permissions =
      await permissionRepository.validatePermission(permissionCodes);
    if (!permissions) throw new NotFoundError("Quyền hạn không hợp lệ!");

    await permissionRepository.assignPermissionToRole(
      roleId,
      permissions.map((p) => p.id),
    );
    await cacheTag.invalidateTag(`role:${role.code}`);
  };
  removePermissionFromRole = async (
    roleId: string,
    permissionCodes: string[],
  ): Promise<void> => {
    const role = await roleRepository.findRoleById(roleId);
    if (!role) throw new NotFoundError("Chức năng không hợp lệ!");

    if (!permissionCodes || permissionCodes.length === 0)
      throw new ValidationError("Không có quyền nào được chọn!");

    const permissions =
      await permissionRepository.validatePermission(permissionCodes);
    if (!permissions) throw new NotFoundError("Quyền hạn không hợp lệ!");

    await permissionRepository.removePermissionFromRole(
      roleId,
      permissions.map((p) => p.id),
    );

    await cacheTag.invalidateTag(`role:${role.code}`);
  };
  assignPermissionToUser = async (
    userId: string,
    permissionCodes: string[],
  ): Promise<void> => {
    const user = await userRepository.findById(prisma, userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    if (!permissionCodes || permissionCodes.length === 0)
      throw new ValidationError("Không có quyền nào được chọn!");

    const permissions =
      await permissionRepository.validatePermission(permissionCodes);
    if (!permissions) throw new NotFoundError("Quyền hạn không hợp lệ!");

    await permissionRepository.assignPermissionToUser(
      userId,
      permissions.map((p) => p.id),
    );
    await Promise.all([
      cacheTag.invalidateTag(`auth:user:${userId}`),
      cacheTag.invalidateTag(`user:${userId}`),
    ]);
  };
  removePermissionFromUser = async (
    userId: string,
    permissionCodes: string[],
  ): Promise<void> => {
    const user = await userRepository.findById(prisma, userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    if (!permissionCodes || permissionCodes.length === 0)
      throw new ValidationError("Không có quyền nào được chọn!");

    const permissions =
      await permissionRepository.validatePermission(permissionCodes);
    if (!permissions) throw new NotFoundError("Quyền hạn không hợp lệ!");

    await permissionRepository.removePermissionFromUser(
      userId,
      permissions.map((p) => p.id),
    );
    await Promise.all([
      cacheTag.invalidateTag(`auth:user:${userId}`),
      cacheTag.invalidateTag(`user:${userId}`),
    ]);
  };
}
export default new PermissionService();
