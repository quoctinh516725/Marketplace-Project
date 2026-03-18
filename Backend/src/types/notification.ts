import { Prisma } from "../../generated/prisma/client";
import { PaginatedResult } from "../dtos";

export const selectedNotification = {
  id: true,
  title: true,
  content: true,
  isRead: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export type NotificationResult = Prisma.NotificationGetPayload<{
  select: typeof selectedNotification;
}>;

export type NotificationListResult = PaginatedResult<NotificationResult>;
