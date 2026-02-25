import { ProductStatus } from "../../constants/productStatus";
import {
  ProductBasicResult,
  ProductDetailResult,
} from "../../types/product.type";
import {
  ProductBasicResponseDto,
  ProductDetailManageResponseDto,
  ProductDetailResponseDto,
} from "./product.response.dto";

export const toProductDetailResponse = (
  product: ProductDetailResult,
): ProductDetailResponseDto => {
  return {
    id: product.id,
    name: product.name,
    code: product.code,
    slug: product.slug,
    description: product.description,
    thumbnailUrl: product.thumbnailUrl,
    originalPrice: product.originalPrice?.toNumber() || null,
    soldCount: product.soldCount,
    rating: product.rating,
    status: product.status as ProductStatus,
    shop: product.shop,
    brand: product.brand,
    images: product.images,
    tags: product.productTags.map((t) => t.tag),
    categories: product.productCategories.map((p) => p.category),

    variants: product.variants.map(({ productAttributes, ...v }) => ({
      id: v.id,
      sku: v.sku,
      variantName: v.variantName,
      imageUrl: v.imageUrl,
      price: v.price.toNumber(),
      stock: v.stock,
      weight: v.weight,
      status: v.status as ProductStatus,
      attributes: productAttributes.map((a) => ({
        attributeId: a.attribute.id,
        code: a.attribute.code,
        valueId: a.attributeValue?.id ?? null,
        value: a.attributeValue?.value ?? null,
      })),
    })),
  };
};

export const toProductDetailManageResponse = (
  product: ProductDetailResult,
): ProductDetailManageResponseDto => {
  const productDetail = toProductDetailResponse(product);
  return {
    ...productDetail,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    deletedAt: product.deletedAt,
  };
};

export const toProductPublicResponse = (
  product: ProductBasicResult,
): ProductBasicResponseDto => {
  return {
    id: product.id,
    name: product.name,
    code: product.code,
    slug: product.slug,
    description: product.description,
    thumbnailUrl: product.thumbnailUrl,
    originalPrice: product.originalPrice?.toNumber() || null,
    soldCount: product.soldCount,
    rating: product.rating,
    status: product.status as ProductStatus,
  };
};
