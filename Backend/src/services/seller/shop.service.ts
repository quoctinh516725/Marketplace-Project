import { Shop } from "../../../generated/prisma/client";
import { CacheKey } from "../../cache/cache.key";
import cacheTag from "../../cache/cache.tag";
import { CacheTTL } from "../../cache/cache.ttl";
import { prisma } from "../../config/prisma";
import { ShopStatus } from "../../constants/shopStatus";
import {
  CreateShopRequestDto,
  ShopDetailResponseDto,
  UpdateShopRequestDto,
} from "../../dtos/shop";
import { toShopDetailResponse } from "../../dtos/shop/mapper.dto";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../error/AppError";
import shopRepository from "../../repositories/shop.repository";
import { cacheAsync } from "../../utils/cache";
import { deleteAuthUserCache } from "../auth/auth.cache";

class ShopService {
  private verifyShop = async (sellerId: string, shopId: string) => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) throw new NotFoundError("Shop không tồn tại!");

    if (shop.sellerId !== sellerId)
      throw new ForbiddenError("Bạn không thể chỉnh sửa shop này!");

    if (shop.status !== ShopStatus.ACTIVE)
      throw new ConflictError("Shop đang không hoạt động hoặc đã bị cấm!");

    return shop;
  };

  getMyShop = async (sellerId: string): Promise<ShopDetailResponseDto> => {
    return await cacheAsync(
      CacheKey.shop.me(sellerId),
      CacheTTL.shop.me,
      [],
      async () => {
        const shop = await shopRepository.findShopBySeller(sellerId);
        if (!shop) throw new NotFoundError("Bạn chưa có cửa hàng!");
        const data = toShopDetailResponse(shop);
        return { data, tags: [`shop:${shop.id}`] };
      },
    );
  };

  createShop = async (
    sellerId: string,
    data: CreateShopRequestDto,
  ): Promise<ShopDetailResponseDto> => {
    const exist = await shopRepository.findShopBySeller(sellerId);
    if (exist) throw new ConflictError("Bạn đã có shop rồi!");

    const existSlug = await shopRepository.findBySlug(data.slug);
    if (existSlug) throw new ConflictError("Slug đã tồn tại!");

    const shop = await shopRepository.create(sellerId, data);
    await Promise.all([
      deleteAuthUserCache(sellerId),
      cacheTag.invalidateTag("shop:list"),
    ]);

    return toShopDetailResponse(shop);
  };

  updateShop = async (
    sellerId: string,
    id: string,
    data: UpdateShopRequestDto,
  ): Promise<ShopDetailResponseDto> => {
    if (data.slug) {
      const exist = await shopRepository.findBySlug(data.slug);
      if (exist && exist.id !== id)
        throw new ConflictError(`Shop với slug "${data.slug}" đã tồn tại!`);
    }

    const shop = await this.verifyShop(sellerId, id);

    // Update shop
    const shopUpdated = await shopRepository.update(prisma, shop.id, data);

    //Invalidate Cache
    await cacheTag.invalidateTag(`shop:${shop.id}`);
    return toShopDetailResponse(shopUpdated);
  };

  updateShopStatus = async (
    sellerId: string,
    id: string,
    status: ShopStatus,
  ): Promise<ShopDetailResponseDto> => {
    const shop = await shopRepository.findShopById(id);
    if (!shop) throw new NotFoundError("Shop không tồn tại!");

    if (shop.sellerId !== sellerId)
      throw new ForbiddenError("Bạn không thể chỉnh sửa shop này!");

    const shopUpdated = await shopRepository.update(prisma, shop.id, {
      status,
    });

    //Invalidate Cache
    await cacheTag.invalidateTag(`shop:${shop.id}`);
    return toShopDetailResponse(shopUpdated);
  };

  updateLogo = async (
    sellerId: string,
    id: string,
    logoUrl: string,
  ): Promise<ShopDetailResponseDto> => {
    const shop = await this.verifyShop(sellerId, id);

    // Update logo
    const shopUpdated = await shopRepository.update(prisma, shop.id, {
      logoUrl,
    });

    //Invalidate Cache
    await cacheTag.invalidateTag(`shop:${shop.id}`);
    return toShopDetailResponse(shopUpdated);
  };
  updateBackground = async (
    sellerId: string,
    id: string,
    backgroundUrl: string,
  ): Promise<ShopDetailResponseDto> => {
    const shop = await this.verifyShop(sellerId, id);

    // Update background
    const shopUpdated = await shopRepository.update(prisma, shop.id, {
      backgroundUrl,
    });

    //Invalidate Cache
    await cacheTag.invalidateTag(`shop:${shop.id}`);
    return toShopDetailResponse(shopUpdated);
  };
}

export default new ShopService();
