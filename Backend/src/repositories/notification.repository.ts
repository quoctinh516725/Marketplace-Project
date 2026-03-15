import { prisma } from "../config/prisma";
import {
  NotificationListResult,
  NotificationResult,
  selectedNotification,
} from "../types/notification";

export interface CreateNotificationData {
  userId: string;
  title: string;
  content: string;
}

export interface UpdateNotificationData {
  title?: string;
  content?: string;
  isRead?: boolean;
}

class NotificationRepository {
  findByNotificationUserId = async (
    userId: string,
    page: number,
    limit: number,
  ): Promise<NotificationListResult> => {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        select: selectedNotification,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return { data: notifications, total };
  };

  countByUserId = async (userId: string): Promise<number> => {
    return prisma.notification.count({
      where: { userId },
    });
  };

  countUnreadByUserId = async (userId: string): Promise<number> => {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  };

  findByIdAndUserId = async (
    id: string,
    userId: string,
  ): Promise<NotificationResult | null> => {
    return await prisma.notification.findFirst({
      where: { id, userId },
      select: selectedNotification,
    });
  };

  markAsRead = async (id: string, userId: string): Promise<void> => {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  };

  markAllAsRead = async (userId: string): Promise<void> => {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  };

  delete = async (id: string, userId: string): Promise<void> => {
    await prisma.notification.deleteMany({
      where: { id, userId },
    });
  };

  create = async (
    data: CreateNotificationData,
  ): Promise<NotificationResult> => {
    return prisma.notification.create({
      data,
      select: selectedNotification,
    });
  };
}

export default new NotificationRepository();
