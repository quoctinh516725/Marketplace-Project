import { VoucherResponseDto } from "./voucher.response";
import { VoucherResult } from "../../types";

export const toVoucherResponseDto = (voucher: VoucherResult): VoucherResponseDto => {
  return {
    id: voucher.id,
    code: voucher.code,
    name: voucher.name,
    description: voucher.description,
    type: voucher.type as VoucherResponseDto["type"],
    shopId: voucher.shopId,
    discountType: voucher.discountType as VoucherResponseDto["discountType"],
    discountValue: voucher.discountValue.toNumber(),
    minOrderValue: voucher.minOrderValue?.toNumber() ?? null,
    maxDiscountAmount: voucher.maxDiscountAmount?.toNumber() ?? null,
    usageLimit: voucher.usageLimit,
    usageCount: voucher.usageCount,
    perUserLimit: voucher.perUserLimit,
    startDate: voucher.startDate,
    endDate: voucher.endDate,
    status: voucher.status,
    createdAt: voucher.createdAt,
    updatedAt: voucher.updatedAt,
  };
};
