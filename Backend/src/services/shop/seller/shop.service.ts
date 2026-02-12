import { Shop } from "../../../../generated/prisma/client";
import { CacheKey } from "../../../cache/cache.key";
import cacheTag from "../../../cache/cache.tag";
import { CacheTTL } from "../../../cache/cache.ttl";
import { prisma } from "../../../config/prisma";
import { ShopStatus } from "../../../constants/shopStatus";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../error/AppError";
import shopRepository, {
  CreateShop,
  UpdateShop,
} from "../../../repositories/shop.repository";
import { cacheAsync } from "../../../utils/cache";
import { deleteAuthUserCache } from "../../auth/auth.cache";

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

  getMyShop = async (sellerId: string): Promise<Shop> => {
    return await cacheAsync(
      CacheKey.shop.me(sellerId),
      CacheTTL.shop.me,
      [],
      async () => {
        const shop = await shopRepository.findShopBySeller(sellerId);
        if (!shop) throw new NotFoundError("Bạn chưa có cửa hàng!");
        return { data: shop, tags: [`shop:${shop.id}`] };
      },
    );
  };

  createShop = async (sellerId: string, data: CreateShop): Promise<Shop> => {
    const exist = await shopRepository.findShopBySeller(sellerId);
    if (exist) throw new ConflictError("Bạn đã có shop rồi!");

    const existSlug = await shopRepository.findBySlug(data.slug);
    if (existSlug) throw new ConflictError("Slug đã tồn tại!");

    await deleteAuthUserCache(sellerId);
    return await shopRepository.create(sellerId, data);
  };

  updateShop = async (
    sellerId: string,
    id: string,
    data: UpdateShop,
  ): Promise<Shop> => {
    if (data.slug) {
      const exist = await shopRepository.findBySlug(data.slug);
      if (exist && exist.id !== id)
        throw new ConflictError(`Shop với slug "${data.slug}" đã tồn tại!`);
    }

    const shop = await this.verifyShop(sellerId, id);

    // Seller only update Active/Inactive status
    const allowedStatuses: ShopStatus[] = [
      ShopStatus.ACTIVE,
      ShopStatus.INACTIVE,
    ];
    if (data.status && !allowedStatuses.includes(data.status as ShopStatus)) {
      throw new ValidationError(`Trạng thái cập nhật không hợp lệ!`);
    }

    // Update shop
    const result = await shopRepository.update(prisma, shop.id, data);

    //Invalidate Cache
    await cacheTag.invalidateTag(`shop:${shop.id}`);
    return result;
  };

  updateLogo = async (
    sellerId: string,
    id: string,
    logoUrl: string,
  ): Promise<Shop> => {
    const shop = await this.verifyShop(sellerId, id);

    // Update logo
    const result = await shopRepository.update(prisma, shop.id, { logoUrl });

    //Invalidate Cache
    await cacheTag.invalidateTag(`shop:${shop.id}`);
    return result;
  };
  updateBackground = async (
    sellerId: string,
    id: string,
    backgroundUrl: string,
  ): Promise<Shop> => {
    const shop = await this.verifyShop(sellerId, id);

    // Update background
    const result = await shopRepository.update(prisma, shop.id, {
      backgroundUrl,
    });

    //Invalidate Cache
    await cacheTag.invalidateTag(`shop:${shop.id}`);
    return result;
  };
}

export default new ShopService();
