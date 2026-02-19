import { CacheKey } from "../../../cache/cache.key";
import { CacheTTL } from "../../../cache/cache.ttl";
import productRepository, {
  ProductAllResponse,
} from "../../../repositories/product.repository";
import { InputAll } from "../../../types";
import { cacheAsync } from "../../../utils/cache";

class ProductService {
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
