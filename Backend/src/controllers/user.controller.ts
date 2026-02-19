import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import userService from "../services/user/user.service";
import { sendSuccess } from "../utils/response";
import { UnauthorizedError, ValidationError } from "../error/AppError";
import { uploadStream } from "../utils/uploadStream";
import {
  updateUserStatusRequestDto,
  userUpdateRequest,
} from "../dtos/user/user.request.dto";
import { UserStatus } from "../constants";

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
      const { page, limit } = req.pagination!;
      const result = await userService.getUsers({
        page,
        limit,
        status: req.query.status as string,
        search: req.query.search as string,
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
    const allowedData = userUpdateRequest(req.body);

    if (!user) {
      throw new UnauthorizedError("Không xác thực người dùng!");
    }
    const result = await userService.update(user.userId, allowedData);
    sendSuccess(res, result, "Cập nhật thông tin người dùng thành công!");
  });
  updateUserStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id as string;
      const status = updateUserStatusRequestDto(req.body.status as UserStatus);
      const currentUser = req.user!;

      const result = await userService.updateUserStatus(
        userId,
        currentUser,
        status,
      );
      sendSuccess(res, result, "Cập nhật trạng thái người dùng thành công!");
    },
  );
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
