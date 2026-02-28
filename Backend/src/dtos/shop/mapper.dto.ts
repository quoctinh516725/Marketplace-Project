import { ShopStatus } from "../../constants/shopStatus";
import { ShopDetailResult } from "../../types";
import { ShopDetailResponseDto } from "./shop.response.dto";

export const toShopDetailResponse = (
  shop: ShopDetailResult,
): ShopDetailResponseDto => {
  return {
    ...shop,
    commissionRate: shop.commissionRate?.toNumber() || null,
    status: shop.status as ShopStatus,
  };
};
