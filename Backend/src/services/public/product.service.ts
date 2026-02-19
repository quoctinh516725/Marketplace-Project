import { Product } from "../../../generated/prisma/client";
import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import { ShopStatus } from "../../constants/shopStatus";
import { ForbiddenError, NotFoundError } from "../../error/AppError";
import productRepository, {
  ProductAllResponse,
} from "../../repositories/product.repository";
import shopRepository from "../../repositories/shop.repository";
import { InputAll } from "../../types";
import { cacheAsync } from "../../utils/cache";
class ProductService {
  getShopProducts = async (
    shopId: string,
    input: InputAll,
  ): Promise<ProductAllResponse> => {
    return cacheAsync(
      CacheKey.shop.shopProduct(input, shopId),
      CacheTTL.shop.product,
      [`shop:product:${shopId}`],
      async () => {
        const shop = await shopRepository.findShopById(shopId);
        if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");
        if (shop.status !== ShopStatus.ACTIVE)
          throw new ForbiddenError("Cửa hàng không hoạt động!");
        const data = await productRepository.getShopProducts(shop.id, input);
        return { data };
      },
    );
  };
  getAllProducts = async (input: InputAll): Promise<ProductAllResponse> => {
    return cacheAsync(
      CacheKey.product.list(input),
      CacheTTL.product.list,
      [`product:list`],
      async () => {
        const data = await productRepository.getAllProducts(input);
        return { data };
      },
    );
  };
}

export default new ProductService();
