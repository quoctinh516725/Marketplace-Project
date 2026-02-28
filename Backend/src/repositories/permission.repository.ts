import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import {
  InputAll,
  PermissionBasicResult,
  PermissionListResult,
} from "../types";
import { PermissionStatus } from "../constants/permissionStatus";
export type CreatePermissionData = {
  code: string;
  description?: string;
};
export type UpdatePermissionData = {
  code?: string;
  description?: string;
  status?: PermissionStatus;
};
export const selectPermissionBasic = {
  id: true,
  code: true,
  status: true,
  description: true,
};
class PermissionRepository {
  create = async (
    data: CreatePermissionData,
  ): Promise<PermissionBasicResult> => {
    return await prisma.permission.create({
      data,
      select: selectPermissionBasic,
    });
  };
  delete = async (id: string): Promise<PermissionBasicResult> => {
    return await prisma.permission.delete({
      where: { id },
      select: selectPermissionBasic,
    });
  };
  getAll = async (input: InputAll): Promise<PermissionListResult> => {
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
        select: selectPermissionBasic,
        orderBy: { code: "asc" },
        skip,
        take,
      }),
      prisma.permission.count({ where }),
    ]);

    return {
      data: permissions,
      total,
    };
  };
  findById = async (id: string): Promise<PermissionBasicResult | null> => {
    return await prisma.permission.findUnique({
      where: { id },
      select: selectPermissionBasic,
    });
  };
  findByCode = async (code: string): Promise<PermissionBasicResult | null> => {
    return await prisma.permission.findUnique({
      where: { code },
      select: selectPermissionBasic,
    });
  };
  getPermissionsByUser = async (userId: string): Promise<string[]> => {
    const result = await prisma.userPermission.findMany({
      where: { userId, permission: { status: PermissionStatus.ACTIVE } },
      select: { permission: { select: { code: true } } },
    });

    return result.map((r) => r.permission.code);
  };
  update = async (
    id: string,
    data: UpdatePermissionData,
  ): Promise<PermissionBasicResult> => {
    return prisma.permission.update({
      where: { id },
      select: selectPermissionBasic,
      data,
    });
  };

  assignPermissionToRole = async (
    roleId: string,
    permissionIds: string[],
  ): Promise<void> => {
    const data = permissionIds.map((p) => ({ roleId, permissionId: p }));
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      await tx.rolePermission.createMany({ data });
    });
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
    await prisma.$transaction(async (tx) => {
      await tx.userPermission.deleteMany({ where: { userId } });
      await tx.userPermission.createMany({ data });
    });
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
