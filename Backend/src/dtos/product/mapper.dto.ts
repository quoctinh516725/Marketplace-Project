import { ProductStatus } from "../../constants/productStatus";
import {
  ProductBasicResult,
  ProductDetailResult,
} from "../../types/product.type";
import {
  ProductBasicResponseDto,
  ProductDetailResponseDto,
} from "./product.response.dto";

export const toProductDetailResponse = (
  product: ProductDetailResult,
): ProductDetailResponseDto => {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    thumbnailUrl: product.thumbnailUrl,
    originalPrice: product.originalPrice?.toNumber() || null,
    soldCount: product.soldCount,
    rating: product.rating,
    status: product.status as ProductStatus,
    shop: product.shop,
    category: product.category,
    brand: product.brand,
    images: product.images,
    tags: product.tags,
    variants: product.variants.map(({ productAttributes, ...v }) => ({
      id: v.id,
      sku: v.sku,
      variantName: v.variantName,
      imageUrl: v.imageUrl,
      price: v.price.toNumber(),
      stock: v.stock,
      weight: v.weight,
      status: v.status as ProductStatus,
      attribute: productAttributes.map((a) => ({
        attributeId: a.attribute.id,
        code: a.attribute.code,
        valueId: a.attributeValue?.id ?? null,
        value: a.attributeValue?.value ?? null,
      })),
    })),
  };
};
export const toProductPublicResponse = (
  product: ProductBasicResult,
): ProductBasicResponseDto => {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    thumbnailUrl: product.thumbnailUrl,
    originalPrice: product.originalPrice?.toNumber() || null,
    soldCount: product.soldCount,
    rating: product.rating,
    status: product.status as ProductStatus,
  };
};
