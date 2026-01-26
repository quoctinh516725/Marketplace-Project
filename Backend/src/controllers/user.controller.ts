import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import userService from "../services/user/user.service";
import { sendSuccess } from "../utils/response";
import { UnauthorizedError, ValidationError } from "../error/AppError";
import UserValidation from "../validations/user.validation";
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
  getUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const status = (req.query.status as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await userService.getUsers({
        page,
        limit,
        status,
        search,
      });

      sendSuccess(res, result, "Lấy thông tin người dùng thành công!");
    },
  );
  getProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id as string;

      const result = await userService.getProfile(userId);

      sendSuccess(res, result, "Lấy thông tin người dùng thành công!");
    },
  );
  getUserById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id as string;

      const result = await userService.getUserById(userId);
      sendSuccess(res, result, "Lấy thông tin người dùng thành công!");
    },
  );
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    const allowedData = UserValidation.validateUserDataUpdate(req.body);

    if (!user) {
      throw new UnauthorizedError("Không xác thực người dùng!");
    }

    const result = await userService.update(user.userId, allowedData);
    sendSuccess(res, result, "Cập nhật thông tin người dùng thành công!");
  });
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id as string;
    const currentUser = req.user!;

    const result = await userService.delete(userId, currentUser);
    sendSuccess(res, result, "Xóa người dùng thành công!");
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
