import { Prisma } from "../../generated/prisma/browser";
import { prisma } from "../config/prisma";

class RoleRepository {
  async validateRoles(roleCodes: string[]) {
    const uniqueRoles = [...new Set(roleCodes)];
    const roles = await prisma.role.findMany({
      where: { code: { in: uniqueRoles } },
      select: { id: true, code: true },
    });
    return roles.length === uniqueRoles.length ? roles : null;
  }
}

export default new RoleRepository();
