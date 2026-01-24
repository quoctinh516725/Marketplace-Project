import { prisma } from "../config/prisma";
import { RoleStatus } from "../constants/roleStatus";
import { PrismaType } from "../types";

class UserRoleRepository {
  async assignRolesToUser(
    client: PrismaType,
    userId: string,
    roleIds: string[],
  ) {
    // Delete tất cả Role hiện tại
    await client.userRole.deleteMany({
      where: {
        userId,
      },
    });

    // Tạo Role cho User
    await client.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
    });
  }

  async findRolesByUser(userId: string): Promise<string[]> {
    const roles = await prisma.userRole.findMany({
      where: { userId, role: { status: RoleStatus.ACTIVE } },
      include: { role: { select: { code: true } } },
    });
    return roles.map((r) => r.role.code);
  }
}

export default new UserRoleRepository();
