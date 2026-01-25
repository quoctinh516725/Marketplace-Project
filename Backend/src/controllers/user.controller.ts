import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import userService from "../services/user/user.service";
import { sendSuccess } from "../utils/response";
import { UnauthorizedError, ValidationError } from "../error/AppError";
import UserValidation from "../validations/user.validation";
import cloudinary from "../config/cloudinary";
import { error } from "node:console";
import { rejects } from "node:assert";
import { resolve } from "node:dns";
import { uploadStream } from "../utils/uploadStream";

class UserController {
  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("Không xác thực người dùng!");
    }
    const result = await userService.getMe(user.userId);
    sendSuccess(res, result, "Lấy thông tin người dùng thành công!");
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    const allowedData = UserValidation.validateUserDataUpdate(req.body);

    if (!user) {
      throw new UnauthorizedError("Không xác thực người dùng!");
    }

    const result = await userService.update(user.userId, allowedData);
    sendSuccess(res, result, "Cập nhật thông tin người dùng thành công!");
  });

  updateAvatar = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const file = req.file;
      const userId = req.user?.userId!;
      if (!file) {
        throw new ValidationError("Không có ảnh được chọn!");
      }
      // Tạo stream để upload lên Cloudinary
      const result: any = await uploadStream(file, {
        folder: `marketplace/user/${userId}/avatar`,
        publicId: "main",
        overwrite: true,
      });

      // Update db
      await userService.updateAvatar(userId, result.secure_url);
      sendSuccess(
        res,
        { url: result.secure_url, public_id: result.public_id },
        "Cập nhật ảnh đại diện thành công!",
      );
    },
  );
}
export default new UserController();
