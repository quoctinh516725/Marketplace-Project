import { Prisma, PrismaClient, Role } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { RoleStatus } from "../constants/roleStatus";
import { PrismaType } from "../types";

type RoleQuery = {
  id: string;
  code: string;
};

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
  create = async (data: CreateRole): Promise<Role> => {
    return await prisma.role.create({ data });
  };
  getAllRoles = async (): Promise<Role[]> => {
    return await prisma.role.findMany({ orderBy: { createdAt: "desc" } });
  };
  updateRole = async (id: string, data: UpdateRole): Promise<Role | null> => {
    return await prisma.role.update({ where: { id }, data });
  };
  delete = async (id: string): Promise<Role | null> => {
    return await prisma.role.delete({ where: { id } });
  };

  findRoleById = async (id: string): Promise<RoleQuery | null> => {
    return await prisma.role.findUnique({
      where: { id },
      select: { id: true, code: true },
    });
  };
  findRoleByCode = async (code: string): Promise<RoleQuery | null> => {
    return await prisma.role.findUnique({
      where: { code },
      select: { id: true, code: true },
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

  validateRoles = async (
    client: PrismaType,
    roleCodes: string[],
  ): Promise<RoleQuery[] | null> => {
    const uniqueRoles = [...new Set(roleCodes)];
    const roles = await client.role.findMany({
      where: { code: { in: uniqueRoles } },
      select: { id: true, code: true },
    });
    return roles.length === uniqueRoles.length ? roles : null;
  };
  asignRoleToUser = async (
    client: PrismaType,
    userId: string,
    roles: string[],
  ): Promise<void> => {
    const data = roles.map((r) => ({ userId, roleId: r }));

    await client.userRole.deleteMany({ where: { userId } });
    await client.userRole.createMany({ data });
  };
  revokeRoleFromUser = async (
    userId: string,
    roleIds: string[],
  ): Promise<void> => {
    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: { in: roleIds },
      },
    });
  };
}

export default new RoleRepository();
