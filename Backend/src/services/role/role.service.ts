import cacheTag from "../../cache/cache.tag";
import { prisma } from "../../config/prisma";
import { UserRole } from "../../constants";
import { RoleStatus } from "../../constants/roleStatus";
import {
  CreateRoleRequestDto,
  RoleBasicResponseDto,
  RoleDetailResponseDto,
  toRoleBasicResponse,
  toRoleDetailResponse,
  toUserDetailResponse,
  UpdateRoleRequestDto,
  UserDetailResponseDto,
} from "../../dtos";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import roleRepository, {
  roleBasicSelect,
} from "../../repositories/role.repository";
import userRepository from "../../repositories/user.repository";
import { PrismaType, RoleBasicResult } from "../../types";

class RoleService {
  private validateRoles = async (
    client: PrismaType,
    roleCodes: string[],
  ): Promise<RoleBasicResult[] | null> => {
    const uniqueRoles = [...new Set(roleCodes)];
    const roles = await client.role.findMany({
      where: { code: { in: uniqueRoles }, status: RoleStatus.ACTIVE },
      select: roleBasicSelect,
    });
    return roles.length === uniqueRoles.length ? roles : null;
  };

  create = async (
    data: CreateRoleRequestDto,
  ): Promise<RoleBasicResponseDto> => {
    //Check role exist
    const exist = await roleRepository.findRoleByCode(data.code);
    if (exist) throw new ConflictError("Chức năng đã tồn tại!");
    const role = await roleRepository.create(data);
    return toRoleBasicResponse(role);
  };
  getAllRoles = async (): Promise<RoleBasicResponseDto[]> => {
    const roles = await roleRepository.getAllRoles();
    return roles.map((r) => toRoleBasicResponse(r));
  };
  getRoleById = async (id: string): Promise<RoleDetailResponseDto> => {
    const role = await roleRepository.findDetailById(id);
    if (!role) throw new NotFoundError("Chức năng không tồn tại!");
    return toRoleDetailResponse(role);
  };
  updateRole = async (
    id: string,
    data: UpdateRoleRequestDto,
  ): Promise<RoleBasicResponseDto> => {
    const role = await roleRepository.findRoleBasicById(id);
    if (!role) throw new NotFoundError("Chức năng không tồn tại!");

    const roleUpdated = await roleRepository.updateRole(id, data);
    await cacheTag.invalidateTag(`role:${roleUpdated.code}`);

    return toRoleBasicResponse(roleUpdated);
  };

  delete = async (id: string): Promise<RoleBasicResponseDto> => {
    const role = await roleRepository.findRoleBasicById(id);
    if (!role) throw new NotFoundError("Chức năng không tồn tại!");

    const roleDeleted = await roleRepository.delete(id);
    await cacheTag.invalidateTag(`role:${roleDeleted.code}`);
    return toRoleBasicResponse(roleDeleted);
  };

  assignRoleToUser = async (
    client: PrismaType,
    id: string,
    roleCodes: UserRole[],
    isInvalidateTag: boolean = true,
  ): Promise<UserDetailResponseDto> => {
    const user = await userRepository.findUserDetailById(client, id);

    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    const roles = await this.validateRoles(client, roleCodes);
    if (!roles) throw new NotFoundError("Chức năng được gán không hợp lệ!");

    await roleRepository.assignRoleToUser(
      client,
      id,
      roles.map((role) => role.id),
    );
    const updatedUser = await userRepository.findUserDetailById(
      client,
      user.id,
    );
    if (isInvalidateTag) {
      await Promise.all([
        cacheTag.invalidateTag(`auth:user:${id}`),
        cacheTag.invalidateTag(`user:${id}`),
      ]);
    }

    return toUserDetailResponse(updatedUser!);
  };
  revokeRoleFromUser = async (
    id: string,
    roleCodes: UserRole[],
  ): Promise<UserDetailResponseDto> => {
    const user = await userRepository.findUserDetailById(prisma, id);
    if (!user) throw new NotFoundError("Người dùng không tồn tại!");

    const roles = await this.validateRoles(prisma, roleCodes);
    if (!roles) throw new NotFoundError("Chức năng được gán không hợp lệ!");

    await roleRepository.revokeRoleFromUser(
      prisma,
      id,
      roles.map((role) => role.id),
    );
    const updatedUser = await userRepository.findUserDetailById(
      prisma,
      user.id,
    );
    await Promise.all([
      cacheTag.invalidateTag(`auth:user:${id}`),
      cacheTag.invalidateTag(`user:${id}`),
    ]);
    return toUserDetailResponse(updatedUser!);
  };
}
export default new RoleService();
