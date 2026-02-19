import { Shop } from "../../generated/prisma/client";
import { ShopStatus } from "../constants/shopStatus";
import { PaginatedResult } from "../dtos";

export type ShopDetailResult = {
  id: string;
  name: string;
  sellerId: string;
  address: string;
  phone: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  backgroundUrl: string | null;
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
  commissionRate: number | null;
  status: ShopStatus;
};

export type ShopListResult = PaginatedResult<ShopDetailResult>;

export const toShopDetailResult = (shop: Shop): ShopDetailResult => ({
  id: shop.id,
  name: shop.name,
  sellerId: shop.sellerId,
  address: shop.address,
  phone: shop.phone,
  slug: shop.slug,
  description: shop.description,
  logoUrl: shop.logoUrl,
  backgroundUrl: shop.backgroundUrl,
  totalProducts: shop.totalProducts,
  totalOrders: shop.totalOrders,
  totalReviews: shop.totalReviews,
  commissionRate: shop.commissionRate?.toNumber() ?? null,
  status: shop.status as ShopStatus,
});
