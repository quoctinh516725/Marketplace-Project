import { CacheKey } from "../../cache/cache.key";
import cacheTag from "../../cache/cache.tag";
import { CacheTTL } from "../../cache/cache.ttl";
import { esClient } from "../../config/elasticsearch";
import { prisma } from "../../config/prisma";
import { ProductStatus } from "../../constants/productStatus";
import {
  toProductDetailManageResponse,
  toProductPublicResponse,
} from "../../dtos/product/mapper.dto";
import {
  ProductBasicResponseDto,
  ProductDetailManageResponseDto,
  ProductListManageResponseDto,
} from "../../dtos/product/product.response.dto";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import productRepository from "../../repositories/product.repository";
import { InputAll } from "../../types";
import { cacheAsync } from "../../utils/cache";

class ProductService {
  getAllProducts = async (
    input: InputAll,
  ): Promise<ProductListManageResponseDto> => {
    return cacheAsync(
      CacheKey.product.staff.list(input),
      CacheTTL.product.list,
      [`product:list`],

      async () => {
        if (
          input.status &&
          !Object.values(ProductStatus).includes(input.status as ProductStatus)
        ) {
          throw new ValidationError("Trạng thái không hợp lệ!");
        }
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

  // Get product by ID
  getProductById = async (
    id: string,
  ): Promise<ProductDetailManageResponseDto> => {
    return cacheAsync(
      CacheKey.product.staff.detail(id),
      CacheTTL.product.detail,
      [`product:${id}`],
      async () => {
        const product = await productRepository.getProductById(id);
        if (!product) throw new NotFoundError("Sản phẩm không tồn tại!");

        const data = toProductDetailManageResponse(product);
        return { data };
      },
    );
  };

  reviewProductApproval = async (
    productId: string,
    status: string,
  ): Promise<ProductBasicResponseDto> => {
    const product = await productRepository.getProductById(productId);
    if (!product) throw new NotFoundError("San pham khong ton tai!");

    if (product.status !== ProductStatus.PENDING_APPROVE) {
      throw new ConflictError("Trang thai san pham khong hop le!");
    }

    const result = await productRepository.updadeStatus(
      prisma,
      productId,
      status,
    );
    await Promise.all([
      cacheTag.invalidateTag("product:list"),
      cacheTag.invalidateTag(`product:shop:${product.shop.id}`),
    ]);

    await esClient.update({
      index: "products",
      id: productId,
      doc: { status },
    });

    return toProductPublicResponse(result);
  };

  updateProductStatus = async (
    productId: string,
    status: string,
  ): Promise<ProductBasicResponseDto> => {
    const product = await productRepository.getProductById(productId);
    if (!product) throw new NotFoundError("San pham khong ton tai!");

    const productUpdated = await productRepository.updadeStatus(
      prisma,
      productId,
      status,
    );

    await esClient.update({
      index: "products",
      id: productId,
      doc: { status },
    });
    await Promise.all([
      cacheTag.invalidateTag("product:list"),
      cacheTag.invalidateTag(`product:shop:${product.shop.id}`),
      cacheTag.invalidateTag(`product:${product.id}`),
    ]);
    return toProductPublicResponse(productUpdated);
  };
}
export default new ProductService();
