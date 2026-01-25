import { RefreshToken, User } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { PrismaType } from "../types";
export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiredAt: Date;
}
class RefreshTokenRepository {
  async findByToken(
    token: string,
  ): Promise<(RefreshToken & { user: User }) | null> {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }
  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token, revoked: false },
      data: { revoked: true },
    });
  }
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
