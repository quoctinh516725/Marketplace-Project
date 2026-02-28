import { Permission } from "../../../generated/prisma/client";
import cacheTag from "../../cache/cache.tag";
import { prisma } from "../../config/prisma";
import { PermissionStatus } from "../../constants/permissionStatus";
import {
  CreatePermissionRequestDto,
  PermissionListResponseDto,
  PermissionResponseDto,
  UpdatePermissionRequestDto,
} from "../../dtos";
import { toPermissionResponseDto } from "../../dtos/permission/mapper.dto";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import permissionRepository from "../../repositories/permission.repository";
import roleRepository from "../../repositories/role.repository";
import userRepository from "../../repositories/user.repository";
import { InputAll } from "../../types";
import { deleteAuthUserCache } from "../auth/auth.cache";

class PermissionService {
  private validatePermission = async (
    permissionCodes: string[],
  ): Promise<{ id: string; code: string }[] | null> => {
    const uniquePermission = [...new Set(permissionCodes)];
    const permissions = await prisma.permission.findMany({
      where: { code: { in: uniquePermission } },
      select: { id: true, code: true },
    });
    return permissions.length === uniquePermission.length ? permissions : null;
  };

  private invalidatePermission = async (id: string) => {
    const roleCodes = (await roleRepository.findRolesByPermissionId(id))
      .roleCodes;
    const userIds = await userRepository.getUserByPermissionId(id);

    const invalidatTasks = [
      ...roleCodes.map((roleCode) =>
        cacheTag.invalidateTag(`role:${roleCode}`),
      ),
      ...userIds.map((u) => deleteAuthUserCache(u)),
    ];

    if (invalidatTasks.length > 0) {
      await Promise.all(invalidatTasks);
    }
  };
  create = async (
    data: CreatePermissionRequestDto,
  ): Promise<PermissionResponseDto> => {
    //Check role exist
    const exist = await permissionRepository.findByCode(data.code);
    if (exist) throw new ConflictError("Quyền hạn đã tồn tại!");

    const permission = await permissionRepository.create(data);
    return toPermissionResponseDto(permission);
  };

  getAll = async (input: InputAll): Promise<PermissionListResponseDto> => {
    const { status, page, limit, search } = input;

    //Validate status
    if (
      status &&
      !Object.values(PermissionStatus).includes(status as PermissionStatus)
    ) {
      throw new ValidationError("Trạng thái không hợp lệ!");
    }

    const permissions = await permissionRepository.getAll({
      status,
      search,
      page,
      limit,
    });

    return {
      data: permissions.data.map((p) => toPermissionResponseDto(p)),
      pagination: {
        page,
        limit,
        total: permissions.total,
      },
    };
  };

  update = async (
    id: string,
    data: UpdatePermissionRequestDto,
  ): Promise<PermissionResponseDto> => {
    const permission = await permissionRepository.findById(id);
    if (!permission) throw new NotFoundError("Quyền không tồn tại!");
    if (data.code) {
      const exist = await permissionRepository.findByCode(data.code);
      if (exist && exist.id !== id)
        throw new ConflictError("Quyền hạn đã tồn tại!");
    }

    const permissionUpdated = await permissionRepository.update(id, data);
    //Invalidate Tag
    await this.invalidatePermission(id);

    return toPermissionResponseDto(permissionUpdated);
  };

  delete = async (id: string): Promise<PermissionResponseDto> => {
    const permission = await permissionRepository.findById(id);
    if (!permission) throw new NotFoundError("Quyền không tồn tại!");

    const permissionDeleted = await permissionRepository.delete(id);
    await this.invalidatePermission(id);

    return toPermissionResponseDto(permissionDeleted);
  };

  assignPermissionToRole = async (
    roleId: string,
    permissionCodes: string[],
  ): Promise<void> => {
    const role = await roleRepository.findRoleBasicById(roleId);
    if (!role) throw new NotFoundError("Chức năng không hợp lệ!");

    if (!permissionCodes || permissionCodes.length === 0)
      throw new ValidationError("Không có quyền nào được chọn!");

    const permissions = await this.validatePermission(permissionCodes);
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
    const role = await roleRepository.findRoleBasicById(roleId);
    if (!role) throw new NotFoundError("Chức năng không hợp lệ!");

    if (!permissionCodes || permissionCodes.length === 0)
      throw new ValidationError("Không có quyền nào được chọn!");

    const permissions = await this.validatePermission(permissionCodes);
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
    const user = await userRepository.findBasicById(prisma, userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    if (!permissionCodes || permissionCodes.length === 0)
      throw new ValidationError("Không có quyền nào được chọn!");

    const permissions = await this.validatePermission(permissionCodes);
    if (!permissions) throw new NotFoundError("Quyền hạn không hợp lệ!");

    await permissionRepository.assignPermissionToUser(
      user.id,
      permissions.map((p) => p.id),
    );
    await Promise.all([
      cacheTag.invalidateTag(`auth:user:${user.id}`),
      cacheTag.invalidateTag(`user:${user.id}`),
    ]);
  };

  removePermissionFromUser = async (
    userId: string,
    permissionCodes: string[],
  ): Promise<void> => {
    const user = await userRepository.findBasicById(prisma, userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    if (!permissionCodes || permissionCodes.length === 0)
      throw new ValidationError("Không có quyền nào được chọn!");

    const permissions = await this.validatePermission(permissionCodes);
    if (!permissions) throw new NotFoundError("Quyền hạn không hợp lệ!");

    await permissionRepository.removePermissionFromUser(
      user.id,
      permissions.map((p) => p.id),
    );
    await Promise.all([
      cacheTag.invalidateTag(`auth:user:${user.id}`),
      cacheTag.invalidateTag(`user:${user.id}`),
    ]);
  };
}
export default new PermissionService();
