import { estypes } from "@elastic/elasticsearch";
import { Product } from "../../../generated/prisma/client";
import { CacheKey } from "../../cache/cache.key";
import { CacheTTL } from "../../cache/cache.ttl";
import { esClient } from "../../config/elasticsearch";
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
import { cacheAsync } from "../../utils/cache";

export interface SearchProductsQuery {
  q?: string;
  categoryIds?: string[];
  shopId?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
  sortBy?: string;
}

interface ProductDocument {
  name: string;
  description: string;
  code: string;
  slug: string;
  thumbnailUrl: string;
  soldCount: number;
  price: number;
  categoryIds: string[];
  shopId: string;
  rating: number;
  createdAt: string;
  status: string;
}

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

  getProductBySlug = async (
    slug: string,
  ): Promise<ProductDetailResponseDto> => {
    return cacheAsync(
      CacheKey.product.public.detail(slug),
      CacheTTL.product.detail,
      [],
      async () => {
        const product = await productRepository.getProductBySlug(
          slug,
          ProductStatus.ACTIVE,
        );
        if (!product) throw new NotFoundError("Sản phẩm không tồn tại!");
        const data = toProductDetailResponse(product);
        return { data, tags: [`product:${product.id}`] };
      },
    );
  };

  searchProducts = async (
    input: SearchProductsQuery,
  ): Promise<ProductListResponseDto> => {
    const { q, categoryIds, shopId, minPrice, maxPrice, page, limit, sortBy } =
      input;

    const should = [];
    const filter = [];
    let sortOption: estypes.Sort = [];
    if (q) {
      should.push(
        {
          multi_match: {
            query: q,
            fields: ["name^3", "description"],
            fuzziness: "AUTO",
          },
        },
        {
          multi_match: {
            query: q,
            fields: ["name^3", "description"],
            type: "bool_prefix" as estypes.QueryDslTextQueryType,
          },
        },
      );
    }

    if (categoryIds && categoryIds.length > 0) {
      filter.push({
        terms: {
          categoryIds,
        },
      });
    }

    if (shopId) {
      filter.push({ term: { shopId } });
    }

    if (minPrice || maxPrice) {
      filter.push({
        range: {
          price: {
            gte: minPrice || 0,
            lte: maxPrice || 999999999,
          },
        },
      });
    }

    switch (sortBy) {
      case "price_asc":
        sortOption = [{ price: "asc" }];
        break;
      case "price_desc":
        sortOption = [{ price: "desc" }];
        break;
      case "created_at_asc":
        sortOption = [{ createdAt: "asc" }];
        break;
      case "created_at_desc":
        sortOption = [{ createdAt: "desc" }];
        break;
      case "rating_asc":
        sortOption = [{ rating: "asc" }];
        break;
      case "rating_desc":
        sortOption = [{ rating: "desc" }];
        break;
      default:
        sortOption = []; // default: relevance
    }

    filter.push({ term: { status: ProductStatus.ACTIVE } });
    const query =
      should.length > 0
        ? {
            bool: {
              should,
              filter,
              minimum_should_match: "70%",
            },
          }
        : {
            bool: {
              filter,
            },
          };
    const result = await esClient.search<ProductDocument>({
      index: "products",
      from: (page - 1) * limit,
      size: limit,
      query,
      sort: sortOption,
    });

    const products = result.hits.hits.map((p) => ({
      id: p._id!,
      ...p._source!,
    }));

    if (!products || products.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
        },
      };
    }

    const total =
      typeof result.hits.total === "number"
        ? result.hits.total
        : result.hits.total?.value || 0;
    return {
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        slug: p.slug,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        originalPrice: p.price || null,
        soldCount: p.soldCount,
        rating: p.rating,
        status: p.status as ProductStatus,
      })),
      pagination: {
        limit,
        page,
        total,
      },
    };
  };
}

export default new ProductService();
