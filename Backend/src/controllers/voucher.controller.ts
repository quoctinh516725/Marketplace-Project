import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import voucherService from "../services/voucher/voucher.service";
import { sendSuccess } from "../utils/response";
import { UnauthorizedError, ValidationError } from "../error/AppError";
import {
  CreateVoucherRequestDto,
  UpdateVoucherRequestDto,
} from "../dtos/voucher/voucher.request.dto";

class VoucherController {
  createVoucher = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData: CreateVoucherRequestDto = req.body;
      const result = await voucherService.createVoucher(validatedData);
      sendSuccess(res, result, "Mã giảm giá đã được tạo thành công");
    },
  );

  updateVoucher = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const validatedData: UpdateVoucherRequestDto = req.body;
      const result = await voucherService.updateVoucher(id, validatedData);
      sendSuccess(res, result, "Mã giảm giá đã được cập nhật thành công");
    },
  );

  deleteVoucher = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      await voucherService.deleteVoucher(id);
      sendSuccess(res, null, "Mã giảm giá đã được xóa thành công");
    },
  );

  getVoucherById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const result = await voucherService.getVoucherById(id);
      sendSuccess(res, result, "Lấy thông tin mã giảm giá thành công");
    },
  );

  getVouchersByShop = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.params.shopId as string;
      const result = await voucherService.getVouchersByShop(shopId);
      sendSuccess(
        res,
        result,
        "Lấy danh sách mã giảm giá của cửa hàng thành công",
      );
    },
  );

  getPlatformVouchers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await voucherService.getPlatformVouchers();
      sendSuccess(res, result, "Lấy danh sách mã giảm giá nền tảng thành công");
    },
  );

  getAllVouchers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;
      const result = await voucherService.getAllVouchers({ page, limit });
      sendSuccess(res, result, "Lấy danh sách tất cả mã giảm giá thành công");
    },
  );
}

const voucherController = new VoucherController();
export default voucherController;
