import { prisma } from "../config/prisma";
import { RoleStatus } from "../constants/roleStatus";
import { PrismaType, RoleBasicResult, roleBasicSelect, RoleDetailResult, roleDetailSelect } from "../types";

export interface CreateRole {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateRole {
  name?: string;
  description?: string;
  status?: RoleStatus;
}

class RoleRepository {
  create = async (data: CreateRole): Promise<RoleBasicResult> => {
    return await prisma.role.create({
      select: roleBasicSelect,
      data,
    });
  };

  getAllRoles = async (): Promise<RoleBasicResult[]> => {
    return await prisma.role.findMany({
      select: roleBasicSelect,
      orderBy: { createdAt: "desc" },
    });
  };

  updateRole = async (
    id: string,
    data: UpdateRole,
  ): Promise<RoleBasicResult> => {
    return await prisma.role.update({
      where: { id },
      select: roleBasicSelect,
      data,
    });
  };

  delete = async (id: string): Promise<RoleBasicResult> => {
    return await prisma.role.delete({
      where: { id },
      select: roleBasicSelect,
    });
  };

  findDetailById = async (id: string): Promise<RoleDetailResult | null> => {
    return await prisma.role.findUnique({
      where: { id },
      select: roleDetailSelect,
    });
  };

  findRoleBasicById = async (id: string): Promise<RoleBasicResult | null> => {
    return await prisma.role.findUnique({
      where: { id },
      select: roleBasicSelect,
    });
  };

  findRoleByCode = async (code: string): Promise<RoleBasicResult | null> => {
    return await prisma.role.findUnique({
      where: { code },
      select: roleBasicSelect,
    });
  };

  findRolesByUser = async (
    userId: string,
  ): Promise<{ roleIds: string[]; roleCodes: string[] }> => {
    const result = await prisma.userRole.findMany({
      where: { userId, role: { status: RoleStatus.ACTIVE } },
      select: { roleId: true, role: { select: { code: true } } },
    });
    return {
      roleIds: result.map((r) => r.roleId),
      roleCodes: result.map((r) => r.role.code),
    };
  };

  findRolesByPermissionId = async (
    permissionId: string,
  ): Promise<{ roleIds: string[]; roleCodes: string[] }> => {
    const result = await prisma.rolePermission.findMany({
      where: { permissionId, role: { status: RoleStatus.ACTIVE } },
      select: { roleId: true, role: { select: { code: true } } },
    });
    return {
      roleIds: result.map((r) => r.roleId),
      roleCodes: result.map((r) => r.role.code),
    };
  };

  assignRoleToUser = async (
    client: PrismaType,
    userId: string,
    roles: string[],
  ): Promise<void> => {
    const data = roles.map((r) => ({ userId, roleId: r }));

    await client.userRole.deleteMany({ where: { userId } });
    await client.userRole.createMany({ data });
  };

  revokeRoleFromUser = async (
    client: PrismaType,
    userId: string,
    roleIds: string[],
  ): Promise<void> => {
    await client.userRole.deleteMany({
      where: {
        userId,
        roleId: { in: roleIds },
      },
    });
  };
}

export default new RoleRepository();
