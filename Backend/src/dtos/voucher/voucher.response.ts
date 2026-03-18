import { PaginatedResponseDto } from "../common";
import { VoucherDiscountType, VoucherType } from "./voucher.request.dto";

export type VoucherResponseDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: VoucherType;
  shopId: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number;
  usageCount: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type VoucherListResponseDto = PaginatedResponseDto<VoucherResponseDto>;
