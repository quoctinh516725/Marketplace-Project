import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import { ShopPublicResponseDto } from "../../dtos/shop";
import { NotFoundError } from "../../error/AppError";
import shopRepository from "../../repositories/shop.repository";
import { cacheAsync } from "../../utils/cache";

class ShopService {
  getShopBySlug = async (slug: string): Promise<ShopPublicResponseDto> => {
    return await cacheAsync(
      CacheKey.shop.detail(slug),
      CacheTTL.shop.detail,
      [],
      async () => {
        const shop = await shopRepository.findBySlug(slug);
        if (!shop) throw new NotFoundError("Bạn chưa có cửa hàng!");
        return { data: shop, tags: [`shop:${shop.id}`] };
      },
    );
  };
}

export default new ShopService();
