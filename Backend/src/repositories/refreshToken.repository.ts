import { prisma } from "../config/prisma";
import { PrismaType } from "../types";
export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiredAt: Date;
}
class RefreshTokenRepository {
  async create(
    client: PrismaType,
    data: CreateRefreshTokenData,
  ): Promise<void> {
    await client.refreshToken.create({ data });
  }
  async revokeAllRefreshToken(
    client: PrismaType,
    userId: string,
  ): Promise<void> {
    await client.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: { revoked: true },
    });
  }
}

export default new RefreshTokenRepository();
