import { prisma } from "../config/prisma";
import { UserRole } from "../constants";

class RoleRepository {
  validateRoles = async (roleCodes: string[]) => {
    const uniqueRoles = [...new Set(roleCodes)];
    const roles = await prisma.role.findMany({
      where: { code: { in: uniqueRoles } },
      select: { id: true, code: true },
    });
    return roles.length === uniqueRoles.length ? roles : null;
  };
  asignRoleToUser = async (id: string, roles: string[]): Promise<void> => {
    const data = roles.map((r) => ({ userId: id, roleId: r }));
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.userRole.createMany({ data });
    });
  };
}

export default new RoleRepository();
