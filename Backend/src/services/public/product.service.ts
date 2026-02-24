import { Product } from "../../../generated/prisma/client";
import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import { ProductStatus } from "../../constants/productStatus";
import { ShopStatus } from "../../constants/shopStatus";
import {
  toProductDetailResponse,
  toProductPublicResponse,
} from "../../dtos/product/mapper.dto";
import {
  ProductDetailResponseDto,
  ProductListResponseDto,
} from "../../dtos/product/product.response.dto";
import { ForbiddenError, NotFoundError } from "../../error/AppError";
import categoryRepository from "../../repositories/category.repository";
import productRepository from "../../repositories/product.repository";
import shopRepository from "../../repositories/shop.repository";
import { InputAll } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import { cacheAsync } from "../../utils/cache";
class ProductService {
  getShopProducts = async (
    shopId: string,
    input: InputAll,
  ): Promise<ProductListResponseDto> => {
    return cacheAsync(
      CacheKey.product.public.shopProducts(input, shopId),
      CacheTTL.product.list,
      [`product:shop:${shopId}`],
      async () => {
        const shop = await shopRepository.findShopById(shopId);
        if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");
        if (shop.status !== ShopStatus.ACTIVE)
          throw new ForbiddenError("Cửa hàng không hoạt động!");
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

  getAllProducts = async (input: InputAll): Promise<ProductListResponseDto> => {
    return cacheAsync(
      CacheKey.product.public.list(input),
      CacheTTL.product.list,
      [`product:list`],
      async () => {
        const products = await productRepository.getAllProducts(input);

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

  getCategoryProducts = async (
    categoryId: string,
    input: InputAll,
  ): Promise<ProductListResponseDto> => {
    return cacheAsync(
      CacheKey.product.public.categoryProducts(input, categoryId),
      CacheTTL.product.list,
      [`product:category:${categoryId}`],
      async () => {
        const category = await categoryRepository.findById(categoryId);
        if (!category) throw new NotFoundError("Danh mục không tồn tại!");
        if (!category.isActive)
          throw new ForbiddenError("Danh mục không hoạt động!");

        const products = await productRepository.getCategoryProducts(
          category.id,
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

  getProductById = async (id: string): Promise<ProductDetailResponseDto> => {
    return cacheAsync(
      CacheKey.product.public.detail(id),
      CacheTTL.product.detail,
      [`product:${id}`],
      async () => {
        const product = await productRepository.getProductById(
          id,
          ProductStatus.ACTIVE,
        );
        if (!product) throw new NotFoundError("Sản phẩm không tồn tại!");
        const data = toProductDetailResponse(product);
        return { data };
      },
    );
  };
}

export default new ProductService();
