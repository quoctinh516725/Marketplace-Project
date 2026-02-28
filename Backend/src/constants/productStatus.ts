export const ProductStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
  DELETED: "DELETED",
  PENDING_APPROVE: "PENDING_APPROVE",
  REJECTED: "REJECTED",
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];
