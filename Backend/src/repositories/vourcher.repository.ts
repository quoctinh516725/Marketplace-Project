import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ValidationError } from "../error/AppError";
import {
  InputAll,
  PrismaType,
  selectedVoucher,
  selectedVoucherWithUserUsage,
  VoucherResult,
  VoucherWithUserUsageResult,
} from "../types";

export type CreateVoucherData = Prisma.VoucherUncheckedCreateInput;
export type UpdateVoucherData = Prisma.VoucherUpdateInput;
export type CreateVoucherUsageData = Prisma.VoucherUsageUncheckedCreateInput;
class VoucherRepository {
  createVoucher = async (
    client: PrismaType,
    data: CreateVoucherData,
  ): Promise<VoucherResult> => {
    return await client.voucher.create({ data, select: selectedVoucher });
  };

  createVoucherUsage = async (
    client: PrismaType,
    data: CreateVoucherUsageData,
  ) => {
    return await client.voucherUsage.create({ data });
  };

  findById = async (
    client: PrismaType,
    id: string,
  ): Promise<VoucherResult | null> => {
    return await client.voucher.findUnique({
      where: { id },
      select: selectedVoucher,
    });
  };

  findByIds = async (
    client: PrismaType,
    ids: string[],
  ): Promise<VoucherResult[]> => {
    return await client.voucher.findMany({
      where: { id: { in: ids } },
      select: selectedVoucher,
    });
  };

  findByCode = async (
    client: PrismaType,
    userId: string,
    code: string,
  ): Promise<VoucherWithUserUsageResult | null> => {
    return await client.voucher.findFirst({
      where: { code },
      select: selectedVoucherWithUserUsage(userId),
    });
  };

  findByCodes = async (
    client: PrismaType,
    userId: string,
    inputs: { code: string; shopId: string }[],
  ): Promise<VoucherWithUserUsageResult[]> => {
    return await client.voucher.findMany({
      where: {
        OR: inputs.map((i) => ({ code: i.code, shopId: i.shopId })),
      },
      select: selectedVoucherWithUserUsage(userId),
    });
  };

  findByShopId = async (
    client: PrismaType,
    shopId: string,
  ): Promise<VoucherResult[]> => {
    return client.voucher.findMany({
      where: { shopId },
      select: selectedVoucher,
      orderBy: { createdAt: "desc" },
    });
  };

  findPlatformVoucher = async (): Promise<VoucherResult[]> => {
    return prisma.voucher.findMany({
      where: { type: "PLATFORM" },
      select: selectedVoucher,
      orderBy: { createdAt: "desc" },
    });
  };

  getUserUsageCount = async (
    client: PrismaType,
    userId: string,
    voucherId: string,
  ) => {
    return await client.voucherUsage.count({ where: { userId, voucherId } });
  };

  incrementUsage = async (client: PrismaType, voucherId: string) => {
    const result = await client.$executeRaw`
    UPDATE "vouchers"
    SET "usage_count" = "usage_count" + 1
    WHERE "id" = ${voucherId} 
    AND "usage_count" < "usage_limit"
    `;

    if (result === 0) {
      throw new ValidationError("Mã giảm giá đã hết lượt dùng!");
    }
  };

  decrementUsage = async (
    client: PrismaType,
    voucherId: string,
  ): Promise<VoucherResult> => {
    return client.voucher.update({
      where: { id: voucherId },
      data: { usageCount: { decrement: 1 } },
      select: selectedVoucher,
    });
  };

  updateVoucher = async (
    client: PrismaType,
    id: string,
    data: UpdateVoucherData,
  ): Promise<VoucherResult> => {
    return await client.voucher.update({
      where: { id },
      data,
      select: selectedVoucher,
    });
  };

  deleteVoucher = async (client: PrismaType, id: string): Promise<void> => {
    await client.voucher.delete({
      where: { id },
    });
  };

  findByCodeAndShopId = async (
    code: string,
    shopId?: string | null,
  ): Promise<VoucherResult | null> => {
    return await prisma.voucher.findFirst({
      where: {
        code,
        shopId: shopId || null,
      },
      select: selectedVoucher,
    });
  };

  findAll = async (input: InputAll): Promise<VoucherResult[]> => {
    const { page, limit } = input;
    const skip = (page - 1) * limit;
    return await prisma.voucher.findMany({
      select: selectedVoucher,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
  };
}

export default new VoucherRepository();
