import { Permission, Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { InputAll } from "../types";
import { PaginatedResponse } from "../types/pagination.type";
import { PermissionStatus } from "../constants/permissionStatus";
export type CreatePermission = {
  code: string;
  description: string;
};
export type UpdatePermission = {
  code?: string;
  description?: string;
  status?: PermissionStatus;
};
export type PermissionAllResponse = PaginatedResponse<Permission>;

class PermissionRepository {
  create = async (data: CreatePermission): Promise<Permission> => {
    return await prisma.permission.create({ data });
  };
  delete = async (id: string): Promise<Permission> => {
    return await prisma.permission.delete({ where: { id } });
  };
  getAll = async (input: InputAll): Promise<PermissionAllResponse> => {
    const { page, limit, status, search } = input;

    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.PermissionWhereInput = {
      ...(status && { status }),
      ...(search && {
        code: {
          contains: search,
        },
      }),
    };

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: { code: "asc" },
        skip,
        take,
      }),
      prisma.permission.count({ where }),
    ]);

    return {
      data: permissions,
      pagination: {
        page,
        limit,
        total,
      },
    };
  };
  findById = async (id: string): Promise<Permission | null> => {
    return await prisma.permission.findUnique({ where: { id } });
  };
  findByCode = async (code: string): Promise<Permission | null> => {
    return await prisma.permission.findUnique({ where: { code } });
  };
  getPermissionsByUser = async (userId: string): Promise<string[]> => {
    const result = await prisma.userPermission.findMany({
      where: { userId, permission: { status: PermissionStatus.ACTIVE } },
      include: { permission: { select: { code: true } } },
    });

    return result.map((r) => r.permission.code);
  };
  update = async (id: string, data: UpdatePermission): Promise<Permission> => {
    return prisma.permission.update({ where: { id }, data });
  };

  assignPermissionToRole = async (
    roleId: string,
    permissionIds: string[],
  ): Promise<void> => {
    const data = permissionIds.map((p) => ({ roleId, permissionId: p }));
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.rolePermission.createMany({ data });
  };

  validatePermission = async (
    permissionCodes: string[],
  ): Promise<{ id: string; code: string }[] | null> => {
    const uniquePermission = [...new Set(permissionCodes)];
    const permissions = await prisma.permission.findMany({
      where: { code: { in: uniquePermission } },
      select: { id: true, code: true },
    });
    return permissions.length === uniquePermission.length ? permissions : null;
  };

  removePermissionFromRole = async (
    roleId: string,
    permissionIds: string[],
  ): Promise<void> => {
    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });
  };

  getPermissionsByRole = async (roleIds: string[]): Promise<string[]> => {
    const result = await prisma.rolePermission.findMany({
      where: {
        roleId: { in: roleIds },
        permission: { status: PermissionStatus.ACTIVE },
      },
      include: { permission: { select: { code: true } } },
    });

    return result.map((r) => r.permission.code);
  };

  assignPermissionToUser = async (
    userId: string,
    permissionIds: string[],
  ): Promise<void> => {
    const data = permissionIds.map((p) => ({ userId, permissionId: p }));
    await prisma.userPermission.deleteMany({ where: { userId } });
    await prisma.userPermission.createMany({ data });
  };

  removePermissionFromUser = async (
    userId: string,
    permissionIds: string[],
  ): Promise<void> => {
    await prisma.userPermission.deleteMany({
      where: {
        userId,
        permissionId: { in: permissionIds },
      },
    });
  };
}

export default new PermissionRepository();
