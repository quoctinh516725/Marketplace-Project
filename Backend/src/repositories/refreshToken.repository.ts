import { prisma } from "../config/prisma";
export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiredAt: Date;
}
class RefreshTokenRepository {
  async create(data: CreateRefreshTokenData): Promise<void> {
    await prisma.refreshToken.create({ data });
  }
}

export default new RefreshTokenRepository();
