import { PaginatedResponseDto } from "../common";

export type NotificationResponseDto = {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponseDto =
  PaginatedResponseDto<NotificationResponseDto>;

export type NotificationUnreadCountResponseDto = {
  count: number;
};
