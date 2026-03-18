import { NotFoundError } from "../../error/AppError";
import notificationRepository from "../../repositories/notification.repository";
import {
  NotificationListResponseDto,
  NotificationUnreadCountResponseDto,
} from "../../dtos/notification/notification.response.dto";
import { toNotificationListResponse } from "../../dtos/notification/mapper.dto";
import { socketService } from "../../socket";
import { InputAll } from "../../types";

class NotificationService {
  createNotification = async (
    userId: string,
    title: string,
    content: string,
  ): Promise<void> => {
    await notificationRepository.create({
      userId,
      title,
      content,
    });

    socketService.emitToUser(userId, "notification", {
      userId,
      title,
      content,
    });
  };

  getNotifications = async (
    userId: string,
    input: InputAll,
  ): Promise<NotificationListResponseDto> => {
    const [notifications, total] = await Promise.all([
      notificationRepository.findByNotificationUserId(userId, input.page, input.limit),
      notificationRepository.countByUserId(userId),
    ]);

    const data = notifications.data.map(toNotificationListResponse);

    return {
      data,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
      },
    };
  };

  getUnreadCount = async (
    userId: string,
  ): Promise<NotificationUnreadCountResponseDto> => {
    const count = await notificationRepository.countUnreadByUserId(userId);
    return { count };
  };

  markAsRead = async (id: string, userId: string): Promise<void> => {
    const notification = await notificationRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!notification) {
      throw new NotFoundError("Thông báo không tồn tại");
    }
    await notificationRepository.markAsRead(id, userId);
  };

  markAllAsRead = async (userId: string): Promise<void> => {
    await notificationRepository.markAllAsRead(userId);
  };

  deleteNotification = async (id: string, userId: string): Promise<void> => {
    const notification = await notificationRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!notification) {
      throw new NotFoundError("Thông báo không tồn tại");
    }
    await notificationRepository.delete(id, userId);
  };
}

const notificationService = new NotificationService();
export default notificationService;
