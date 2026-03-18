import {
  CreateVoucherRequestDto,
  toVoucherResponseDto,
  VoucherResponseDto,
  UpdateVoucherRequestDto,
} from "../../dtos";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../error/AppError";
import voucherRepository, {
  CreateVoucherUsageData,
} from "../../repositories/vourcher.repository";
import {
  InputAll,
  PrismaType,
  VoucherWithUserUsageResult,
  selectedVoucher,
} from "../../types";
import shopRepository from "../../repositories/shop.repository";
import { prisma } from "../../config/prisma";
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

  applyVoucher = async (client: PrismaType, data: CreateVoucherUsageData[]) => {
    // Increment UsageCount
    for (const v of data) {
      await voucherRepository.incrementUsage(client, v.voucherId);
    }
    await voucherRepository.createVoucherUsage(client, data);
  };

  createVoucher = async (
    data: CreateVoucherRequestDto,
  ): Promise<VoucherResponseDto> => {
    // Validate type and shopId
    if (data.type === "SHOP") {
      if (!data.shopId) {
        throw new ValidationError(
          "ID cửa hàng là bắt buộc cho loại voucher SHOP",
        );
      }
      const shop = await shopRepository.findShopById(data.shopId);
      if (!shop) {
        throw new NotFoundError("Cửa hàng không tồn tại");
      }

      if (shop.status !== "ACTIVE") {
        throw new ValidationError("Cửa hàng không hoạt động");
      }
    } else if (data.type === "PLATFORM") {
      if (data.shopId) {
        throw new ValidationError(
          "Không được cung cấp ID cửa hàng cho loại voucher PLATFORM",
        );
      }
    } else {
      throw new ValidationError(
        "Loại voucher không hợp lệ. Phải là PLATFORM hoặc SHOP",
      );
    }

    // Validate discount
    if (data.discountType === "PERCENT") {
      if (data.discountValue <= 0 || data.discountValue > 100) {
        throw new ValidationError(
          "Giá trị giảm giá theo phần trăm phải từ 1 đến 100",
        );
      }
    } else if (data.discountType === "FIXED") {
      if (data.discountValue <= 0) {
        throw new ValidationError("Giá trị giảm giá cố định phải lớn hơn 0");
      }
    } else {
      throw new ValidationError(
        "Loại giảm giá không hợp lệ. Phải là PERCENT hoặc FIXED",
      );
    }

    // Validate dates
    if (data.startDate >= data.endDate) {
      throw new ValidationError("Ngày bắt đầu phải trước ngày kết thúc");
    }

    // Check unique code
    const existing = await voucherRepository.findByCodeAndShopId(
      data.code,
      data.shopId,
    );
    if (existing) {
      throw new ConflictError("Mã voucher đã tồn tại");
    }

    const voucher = await voucherRepository.createVoucher(prisma, data);
    return toVoucherResponseDto(voucher);
  };

  updateVoucher = async (
    id: string,
    data: UpdateVoucherRequestDto,
  ): Promise<VoucherResponseDto> => {
    const existing = await voucherRepository.findById(prisma, id);
    if (!existing) {
      throw new NotFoundError("Voucher không tồn tại");
    }

    // Validate type and shopId if updating
    if (data.type) {
      if (data.type === "SHOP") {
        if (!data.shopId && !existing.shopId) {
          throw new ValidationError(
            "ID cửa hàng là bắt buộc cho loại voucher SHOP",
          );
        }
        if (data.shopId) {
          const shop = await shopRepository.findShopById(data.shopId);
          if (!shop) {
            throw new NotFoundError("Cửa hàng không tồn tại");
          }
          if (shop.status !== "ACTIVE") {
            throw new ValidationError("Cửa hàng không hoạt động");
          }
        }
      } else if (data.type === "PLATFORM") {
        if (data.shopId !== undefined) {
          throw new ValidationError(
            "Không được cung cấp ID cửa hàng cho loại voucher PLATFORM",
          );
        }
      }
    }

    // Validate discount if updating
    if (data.discountType || data.discountValue !== undefined) {
      const discountType = data.discountType || existing.discountType;
      const discountValue =
        data.discountValue !== undefined
          ? Number(data.discountValue)
          : Number(existing.discountValue);

      if (discountType === "PERCENT") {
        if (discountValue <= 0 || discountValue > 100) {
          throw new ValidationError(
            "Giá trị giảm giá theo phần trăm phải từ 1 đến 100",
          );
        }
      } else if (discountType === "FIXED") {
        if (discountValue <= 0) {
          throw new ValidationError("Giá trị giảm giá cố định phải lớn hơn 0");
        }
      }
    }

    // Validate dates if updating
    const startDate = data.startDate || existing.startDate;
    const endDate = data.endDate || existing.endDate;
    if (startDate >= endDate) {
      throw new ValidationError("Ngày bắt đầu phải trước ngày kết thúc");
    }

    // Check unique code if updating code
    if (data.code && data.code !== existing.code) {
      const shopId = data.shopId !== undefined ? data.shopId : existing.shopId;
      const existingCode = await voucherRepository.findByCodeAndShopId(
        data.code,
        shopId,
      );
      if (existingCode) {
        throw new ConflictError("Mã voucher đã tồn tại");
      }
    }

    const voucher = await voucherRepository.updateVoucher(prisma, id, data);
    return toVoucherResponseDto(voucher);
  };

  deleteVoucher = async (id: string): Promise<void> => {
    const existing = await voucherRepository.findById(prisma, id);
    if (!existing) {
      throw new NotFoundError("Voucher không tồn tại");
    }

    // Check if voucher has been used
    if (existing.usageCount > 0) {
      throw new ValidationError("Không thể xóa voucher đã được sử dụng");
    }

    await voucherRepository.deleteVoucher(prisma, id);
  };

  getVoucherById = async (id: string): Promise<VoucherResponseDto> => {
    const voucher = await voucherRepository.findById(prisma, id);
    if (!voucher) {
      throw new NotFoundError("Voucher không tồn tại");
    }
    return toVoucherResponseDto(voucher);
  };

  getVouchersByShop = async (shopId: string): Promise<VoucherResponseDto[]> => {
    const vouchers = await voucherRepository.findByShopId(prisma, shopId);
    return vouchers.map(toVoucherResponseDto);
  };

  getPlatformVouchers = async (): Promise<VoucherResponseDto[]> => {
    const vouchers = await voucherRepository.findPlatformVoucher();
    return vouchers.map(toVoucherResponseDto);
  };

  getAllVouchers = async (input: InputAll): Promise<VoucherResponseDto[]> => {
    const allVouchers = await voucherRepository.findAll(input);
    return allVouchers.map(toVoucherResponseDto);
  };
}
export default new VoucherService();
