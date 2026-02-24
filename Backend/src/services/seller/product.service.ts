import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import { ProductStatus } from "../../constants/productStatus";
import {
  toProductDetailResponse,
  toProductPublicResponse,
} from "../../dtos/product/mapper.dto";
import {
  ProductDetailResponseDto,
  ProductListResponseDto,
} from "../../dtos/product/product.response.dto";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import productRepository from "../../repositories/product.repository";
import shopRepository from "../../repositories/shop.repository";
import { InputAll } from "../../types";
import { cacheAsync } from "../../utils/cache";

class ProductService {
  getMyProducts = async (
    shopId: string,
    input: InputAll,
  ): Promise<ProductListResponseDto> => {
    return cacheAsync(
      CacheKey.product.seller.shopProducts(input, shopId),
      CacheTTL.product.list,
      [`product:shop:${shopId}`],
      async () => {
        if (
          input.status &&
          !Object.values(ProductStatus).includes(input.status as ProductStatus)
        ) {
          throw new ValidationError("Trạng thái không hợp lệ!");
        }
        const shop = await shopRepository.findShopById(shopId);
        if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");
        const products = await productRepository.getShopProducts(
          shop.id,
          input,
        );

        const data = {
          data: products.data.map(toProductPublicResponse),
          pagination: {
            page: input.page,
            limit: input.limit,
            total: products.total,
          },
        };
        return { data };
      },
    );
  };

  // Get my product by ID
  getMyProductById = async (
    id: string,
    shopId: string,
  ): Promise<ProductDetailResponseDto> => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");

    const product = await productRepository.getProductById(id);
    if (!product) throw new NotFoundError("Sản phẩm không tồn tại!");

    if (
      product.status !== ProductStatus.ACTIVE &&
      product.shop.id !== shop.id
    ) {
      throw new ForbiddenError("Không thể lấy sản phẩm của cửa hàng khác!");
    }
    return toProductDetailResponse(product);
  };
}

export default new ProductService();
