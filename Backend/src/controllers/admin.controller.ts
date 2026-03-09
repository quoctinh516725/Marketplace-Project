import { Request, Response } from "express";
import {
  createSystemSettingRequestDto,
  updateSystemSettingRequestDto,
} from "../dtos";
import { ValidationError } from "../error/AppError";
import adminService from "../services/admin/admin.service";
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
}

export default new AdminController();
