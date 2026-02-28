import { Prisma, Shop } from "../../generated/prisma/client";
import { ShopStatus } from "../constants/shopStatus";
import { PaginatedResult } from "../dtos";

export const selectShopPublic = {
  id: true,
  name: true,
  address: true,
  phone: true,
  description: true,
  logoUrl: true,
  backgroundUrl: true,
  totalProducts: true,
} satisfies Prisma.ShopSelect;

export const selectShopDetail = {
  id: true,
  name: true,
  sellerId: true,
  address: true,
  phone: true,
  slug: true,
  description: true,
  logoUrl: true,
  backgroundUrl: true,
  totalProducts: true,
  totalOrders: true,
  totalReviews: true,
  commissionRate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ShopSelect;

export type ShopPublicResult = Prisma.ShopGetPayload<{
  select: typeof selectShopPublic;
}>;

export type ShopDetailResult = Prisma.ShopGetPayload<{
  select: typeof selectShopDetail;
}>;

export type ShopListResult = PaginatedResult<ShopDetailResult>;
