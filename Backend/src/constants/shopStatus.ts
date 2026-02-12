export const ShopStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
  PENDING_APPROVE: "PENDING_APPROVE",
  REJECTED: "REJECTED",
} as const;

export type ShopStatus = (typeof ShopStatus)[keyof typeof ShopStatus];
