import { Prisma } from "../../generated/prisma/client";
import { PaginatedResult } from "../dtos";

export const selectProductBasic = {
  id: true,
  name: true,
  slug: true,
  description: true,
  thumbnailUrl: true,
  originalPrice: true,
  soldCount: true,
  rating: true,
  status: true,
} satisfies Prisma.ProductSelect;

export const selectProductDetail = {
  ...selectProductBasic,

  shop: {
    select: {
      id: true,
      name: true,
    },
  },

  category: {
    select: {
      id: true,
      name: true,
    },
  },

  brand: {
    select: {
      id: true,
      name: true,
      logoUrl: true,
    },
  },

  images: {
    select: {
      id: true,
      imageUrl: true,
    },
  },

  variants: {
    select: {
      id: true,
      sku: true,
      variantName: true,
      imageUrl: true,
      price: true,
      stock: true,
      weight: true,
      status: true,
      productAttributes: {
        select: {
          attributeValue: {
            select: {
              id: true,
              value: true,
            },
          },
          attribute: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      },
    },
  },

  tags: {
    select: {
      id: true,
      tag: true,
    },
  },
} satisfies Prisma.ProductSelect;

export type ProductBasicResult = Prisma.ProductGetPayload<{
  select: typeof selectProductBasic;
}>;

export type ProductDetailResult = Prisma.ProductGetPayload<{
  select: typeof selectProductDetail;
}>;
export type ProductListResult = PaginatedResult<ProductBasicResult>;
