import { Prisma } from "../../generated/prisma/client";

export const selectedVoucher = {
  id: true,
  code: true,
  name: true,
  description: true,
  type: true,
  shopId: true,
  discountType: true,
  discountValue: true,
  minOrderValue: true,
  maxDiscountAmount: true,
  usageLimit: true,
  usageCount: true,
  perUserLimit: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VoucherSelect;

export const selectedVoucherWithUserUsage = (userId: string) =>
  ({
    ...selectedVoucher,
    _count: {
      select: {
        usages: {
          where: { userId },
        },
      },
    },
  }) satisfies Prisma.VoucherSelect;

export type VoucherWithUserUsageResult = Prisma.VoucherGetPayload<{
  select: ReturnType<typeof selectedVoucherWithUserUsage>;
}>;

export type VoucherResult = Prisma.VoucherGetPayload<{
  select: typeof selectedVoucher;
}>;
