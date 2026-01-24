import { prisma } from "../config/prisma";

class UserRoleRepository {
  async assignRolesToUser(userId: string, roleIds: string[]) {
    await prisma.$transaction(async (tx) => {
      // Delete tất cả Role hiện tại
      await tx.userRole.deleteMany({
        where: {
          userId,
        },
      });

      // Tạo Role cho User
      await tx.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId, roleId })),
      });
    });
  }
}

export default new UserRoleRepository();
