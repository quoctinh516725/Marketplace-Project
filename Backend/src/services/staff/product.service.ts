import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import { ProductStatus } from "../../constants/productStatus";
import {
  toProductDetailManageResponse,
  toProductDetailResponse,
  toProductPublicResponse,
} from "../../dtos/product/mapper.dto";
import {
  ProductDetailManageResponseDto,
  ProductDetailResponseDto,
  ProductListManageResponseDto,
  ProductListResponseDto,
} from "../../dtos/product/product.response.dto";
import { NotFoundError, ValidationError } from "../../error/AppError";
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
}
export default new ProductService();
