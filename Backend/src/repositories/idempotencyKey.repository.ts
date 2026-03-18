import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";

type CreateIdempotencyKeyData = Prisma.IdempotentKeyUncheckedCreateInput;
type UpdateIdempotencyKeyData = Prisma.IdempotentKeyUncheckedUpdateInput;
class IdempotencyKeyRepository {
  create = async (data: CreateIdempotencyKeyData) => {
    return await prisma.idempotentKey.create({
      data,
    });
  };
  updateStatus = async (key: string, userId: string, status: string) => {
    return await prisma.idempotentKey.update({
      where: { key_userId: { key, userId } },
      data: { status },
    });
  };

  update = async (
    key: string,
    userId: string,
    data: UpdateIdempotencyKeyData,
  ) => {
    return await prisma.idempotentKey.update({
      where: { key_userId: { key, userId } },
      data,
    });
  };

  findKey = async (key: string, userId: string) => {
    return await prisma.idempotentKey.findUnique({
      where: {
        key_userId: { key, userId },
      },
    });
  };

  deleteKey = async (date: Date) => {
    return await prisma.idempotentKey.deleteMany({
      where: {
        expiresAt: {
          lt: date,
        },
      },
    });
  };
}

export default new IdempotencyKeyRepository();
