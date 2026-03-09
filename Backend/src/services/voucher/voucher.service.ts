import {
  CreateVoucherRequestDto,
  toVoucherResponseDto,
  VoucherResponseDto,
} from "../../dtos";
import { NotFoundError, ValidationError } from "../../error/AppError";
import voucherRepository, {
  CreateVoucherUsageData,
} from "../../repositories/vourcher.repository";
import { PrismaType, VoucherWithUserUsageResult } from "../../types";
import { formatMoneyVND } from "../../utils/format";

class VoucherService {
  baseValidationVoucher = (voucher: VoucherWithUserUsageResult) => {
    const voucherCode = voucher.code;

    if (voucher.status !== "ACTIVE") {
      throw new ValidationError(
        `Mã giảm giá ${voucherCode} không được kích hoạt!`,
      );
    }

    if (voucher.usageCount >= voucher.usageLimit) {
      throw new ValidationError(`Mã giảm giá ${voucherCode} đã được dùng hết!`);
    }

    const userUsageCount = voucher._count.usages;
    if (userUsageCount >= voucher.perUserLimit) {
      throw new ValidationError(
        `Bạn đã dùng hết lượt cho mã giảm giá ${voucherCode} rồi!`,
      );
    }

    const now = new Date();
    if (now < voucher.startDate) {
      throw new ValidationError(
        `Mã giảm giá ${voucherCode} chưa tới hạn sử dụng!`,
      );
    }
    if (now > voucher.endDate) {
      throw new ValidationError(
        `Mã giảm giá ${voucherCode} đã hết hạn sử dụng!`,
      );
    }
  };

  validationShopVoucher = async (
    client: PrismaType,
    userId: string,
    voucherInputs: { shopId: string; code: string; shopOrderTotal: number }[],
  ): Promise<
    { discountAmount: number; shopId: string; voucher: VoucherResponseDto }[]
  > => {
    const voucherInputMaps = new Map(
      voucherInputs.map((v) => [`${v.shopId}_${v.code}`, v]),
    );

    const vouchers = await voucherRepository.findByCodes(
      client,
      userId,
      voucherInputs,
    );

    const foundKeys = new Set(vouchers.map((v) => `${v.shopId}_${v.code}`));

    const invalidInputs = voucherInputs.filter(
      (v) => !foundKeys.has(`${v.shopId}_${v.code}`),
    );

    if (invalidInputs.length > 0) {
      throw new NotFoundError(
        `Các mã giảm giá không phù hợp: ${invalidInputs
          .map((v) => v.code)
          .join(", ")}`,
      );
    }
    return vouchers.map((v) => {
      this.baseValidationVoucher(v);

      const minOrderValue = v.minOrderValue?.toNumber();
      const maxDiscountAmount = v.maxDiscountAmount?.toNumber();
      const discountValue = v.discountValue.toNumber();

      const input = voucherInputMaps.get(`${v.shopId}_${v.code}`)!;

      if (minOrderValue && minOrderValue > input?.shopOrderTotal) {
        throw new ValidationError(
          `Đơn hàng chưa đạt đủ giá trị tối thiểu của mã giảm giá ${input.code}. Cần mua thêm ${formatMoneyVND(minOrderValue - input.shopOrderTotal)}`,
        );
      }

      if (v.shopId !== input.shopId) {
        throw new ValidationError(
          `Mã giảm giá ${input.code} không thuộc cửa hàng này!`,
        );
      }

      let discountAmount = 0;
      if (v.discountType === "PERCENT") {
        discountAmount = (input?.shopOrderTotal * discountValue) / 100;
        if (maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, maxDiscountAmount);
        }
        discountAmount = Math.floor(discountAmount);
      } else {
        discountAmount = Math.min(discountValue, input?.shopOrderTotal);
      }

      return {
        discountAmount,
        shopId: v.shopId,
        voucher: toVoucherResponseDto(v),
      };
    });
  };

  validationPlatformVoucher = async (
    client: PrismaType,
    userId: string,
    voucherInput: { code: string; orderTotal: number },
  ): Promise<{ discountAmount: number; voucher: VoucherResponseDto }> => {
    const voucher = await voucherRepository.findByCode(
      client,
      userId,
      voucherInput.code,
    );

    if (!voucher)
      throw new NotFoundError(
        `Mã giảm giá toàn sàn không phù hợp: ${voucherInput.code}`,
      );

    this.baseValidationVoucher(voucher);

    const minOrderValue = voucher.minOrderValue?.toNumber();
    const maxDiscountAmount = voucher.maxDiscountAmount?.toNumber();
    const discountValue = voucher.discountValue.toNumber();

    if (minOrderValue && minOrderValue > voucherInput.orderTotal) {
      throw new ValidationError(
        `Đơn hàng chưa đạt đủ giá trị tối thiểu của mã giảm giá ${voucherInput.code}. Cần mua thêm ${formatMoneyVND(minOrderValue - voucherInput.orderTotal)}`,
      );
    }

    let discountAmount = 0;
    if (voucher.discountType === "PERCENT") {
      discountAmount = (voucherInput.orderTotal * discountValue) / 100;
      if (maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, maxDiscountAmount);
      }
      discountAmount = Math.floor(discountAmount);
    } else {
      discountAmount = Math.min(discountValue, voucherInput.orderTotal);
    }

    return {
      discountAmount,
      voucher: toVoucherResponseDto(voucher),
    };
  };

  //   createVoucher = async (
  //     data: CreateVoucherRequestDto,
  //     shopId?: string,
  //   ): Promise<VoucherResponseDto> => {};

  applyVoucher = async (client: PrismaType, data: CreateVoucherUsageData[]) => {
    // Increment UsageCount
    await Promise.all(
      data.flatMap((v) => [
        voucherRepository.incrementUsage(client, v.voucherId),
        voucherRepository.createVoucherUsage(client, v),
      ]),
    );
  };
}
export default new VoucherService();
