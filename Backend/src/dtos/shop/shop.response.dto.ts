import { ShopStatus } from "../../constants/shopStatus";
import { PaginatedResponseDto } from "../common";

export type ShopDetailResponseDto = {
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

export type ShopListResponseDto = PaginatedResponseDto<ShopDetailResponseDto>;
