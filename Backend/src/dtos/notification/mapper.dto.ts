import { NotificationListResult } from "../../repositories/notification.repository";
import { NotificationResponseDto } from "./notification.response.dto";

export const toNotificationListResponse = (
  notification: NotificationListResult,
): NotificationResponseDto => ({
  id: notification.id,
  title: notification.title,
  content: notification.content,
  isRead: notification.isRead,
  createdAt: notification.createdAt.toISOString(),
});
