import { prisma } from "../config/prisma";
import { PrismaType } from "../types";

class OauthRepository {
  existProviderUserId = async (provider: string, providerUserId: string) => {
    const oauthAccount = await prisma.oauthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: provider,
          providerUserId: providerUserId,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            status: true,
          },
        },
      },
    });
    return oauthAccount?.user ?? null;
  };


  create = async (client:PrismaType, userId: string, provider: string, providerUserId: string) => {
    return await client.oauthAccount.create({
      data: {
        userId,
        provider,
        providerUserId,
      },
    });
  };
}

export default new OauthRepository();
