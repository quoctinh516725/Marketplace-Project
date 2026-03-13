import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";

export interface NotificationListResult {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

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
  findByUserIdPaginated = async (
    userId: string,
    page: number,
    limit: number,
  ): Promise<NotificationListResult[]> => {
    const skip = (page - 1) * limit;
    return prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
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
  ): Promise<NotificationListResult | null> => {
    return prisma.notification.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
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
  ): Promise<NotificationListResult> => {
    return prisma.notification.create({
      data,
      select: {
        id: true,
        title: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    });
  };
}

const notificationRepository = new NotificationRepository();
export default notificationRepository;
