import { Request, Response } from "express";
import {
  createSystemSettingRequestDto,
  updateSystemSettingRequestDto,
} from "../dtos";
import { ValidationError } from "../error/AppError";
import adminService from "../services/admin/admin.service";
import analyticService from "../services/analytic/analytic.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

class AdminController {
  getSystemSettings = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await adminService.getSystemSettings();
      sendSuccess(res, settings, "Lay cau hinh he thong thanh cong!");
    },
  );

  createSystemSetting = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const adminId = req.user!.userId;
      const payload = createSystemSettingRequestDto(req.body);

      const setting = await adminService.createSystemSetting(adminId, payload);

      sendSuccess(res, setting, "Tao cau hinh he thong thanh cong!");
    },
  );

  updateSystemSetting = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { key } = req.params;
      const adminId = req.user!.userId;

      if (!key) {
        throw new ValidationError("Vui long cung cap key!");
      }

      const payload = updateSystemSettingRequestDto(req.body);
      const setting = await adminService.updateSystemSetting(
        adminId,
        key as string,
        payload,
      );

      sendSuccess(res, setting, "Cap nhat cau hinh he thong thanh cong!");
    },
  );

  deleteSystemSetting = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { key } = req.params;
      const adminId = req.user!.userId;

      if (!key) {
        throw new ValidationError("Vui long cung cap key!");
      }

      const setting = await adminService.deleteSystemSetting(
        adminId,
        key as string,
      );

      sendSuccess(res, setting, "Xoa cau hinh he thong thanh cong!");
    },
  );

  // Analytics
  getOverview = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await analyticService.getAdminOverview();
      sendSuccess(res, result, "Lấy thống kê hệ thống thành công!");
    },
  );

  getRevenueByTime = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const range = (req.query.range as string) || "7d";
      const result = await analyticService.getAdminRevenueByTime(range);
      sendSuccess(
        res,
        result,
        "Lấy dữ liệu doanh thu theo thời gian thành công!",
      );
    },
  );

  getTopProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await analyticService.getAdminTopProducts();
      sendSuccess(res, result, "Lấy danh sách sản phẩm bán chạy thành công!");
    },
  );

  getTopShops = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await analyticService.getAdminTopShops();
      sendSuccess(
        res,
        result,
        "Lấy danh sách cửa hàng doanh thu cao thành công!",
      );
    },
  );
}

export default new AdminController();
