export const ProductStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
  DELETED: "DELETED",
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];
