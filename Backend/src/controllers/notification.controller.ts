import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import notificationService from "../services/notification/notification.service";
import { sendSuccess } from "../utils/response";
import { UnauthorizedError } from "../error/AppError";

class NotificationController {
  getNotifications = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;
      const { page, limit } = req.pagination!;

      const result = await notificationService.getNotifications(
        userId,
        page,
        limit,
      );
      sendSuccess(res, result, "Lấy danh sách thông báo thành công!");
    },
  );

  getUnreadCount = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;
      const result = await notificationService.getUnreadCount(userId);
      sendSuccess(res, result, "Lấy số lượng thông báo chưa đọc thành công");
    },
  );

  markAsRead = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;
      const id = req.params.id as string;
      await notificationService.markAsRead(id, userId);
      sendSuccess(res, null, "Đánh dấu thông báo là đã đọc thành công");
    },
  );

  markAllAsRead = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;

      await notificationService.markAllAsRead(userId);
      sendSuccess(
        res,
        null,
        "Tất cả thông báo đều được đánh dấu là đã đọc thành công",
      );
    },
  );

  deleteNotification = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;

      const id = req.params.id as string;
      await notificationService.deleteNotification(id, userId);
      sendSuccess(res, null, "Xóa thông báo thành công");
    },
  );
}

export default new NotificationController();
