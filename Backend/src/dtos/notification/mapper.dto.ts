import { NotificationResult } from "../../types/notification";
import { NotificationResponseDto } from "./notification.response.dto";

export const toNotificationListResponse = (
  notification: NotificationResult,
): NotificationResponseDto => ({
  id: notification.id,
  title: notification.title,
  content: notification.content,
  isRead: notification.isRead,
  createdAt: notification.createdAt.toISOString(),
});
