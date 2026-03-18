export type VoucherType = "PLATFORM" | "SHOP";
export type VoucherDiscountType = "PERCENT" | "FIXED";

export type CreateVoucherRequestDto = {
  code: string;
  name: string;
  description?: string;
  type: VoucherType;
  shopId?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  perUserLimit?: number;
  startDate: Date;
  endDate: Date;
  status?: string;
};

export type CreateVoucherUsageRequestDto = {
  userId: string;
  voucherId: string;
  usedAt: Date;
};

export type UpdateVoucherRequestDto = {
  code?: string;
  name?: string;
  description?: string;
  type?: VoucherType;
  shopId?: string | null;
  discountType?: VoucherDiscountType;
  discountValue?: number;
  minOrderValue?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number;
  usageCount?: number;
  perUserLimit?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
};
