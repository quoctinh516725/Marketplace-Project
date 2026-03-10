import { Prisma } from "../../generated/prisma/client";
import { PaginatedResult } from "../dtos";

export const selectProductBasic = {
  id: true,
  name: true,
  code: true,
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
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  shop: {
    select: {
      id: true,
      name: true,
    },
  },

  productCategories: {
    select: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
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
    where: { deletedAt: null },
    select: {
      id: true,
      sku: true,
      variantName: true,
      imageUrl: true,
      price: true,
      stock: true,
      weight: true,
      status: true,
      deletedAt: true,
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

  productTags: {
    select: {
      tag: {
        select: { id: true, name: true },
      },
    },
  },
} satisfies Prisma.ProductSelect;

export const selectProductVariant = {
  id: true,
  imageUrl: true,
  price: true,
  stock: true,
  variantName: true,
  weight: true,
  deletedAt: true,
  product: {
    select: {
      id: true,
      code: true,
      name: true,
      thumbnailUrl: true,
      deletedAt: true,
      shop: {
        select: {
          id: true,
          districtId: true,
          provinceId: true,
          wardCode: true,
          commissionRate: true,
        },
      },
    },
  },
} satisfies Prisma.ProductVariantSelect;

export type ProductVariantResult = Prisma.ProductVariantGetPayload<{
  select: typeof selectProductVariant;
}>;

export type ProductBasicResult = Prisma.ProductGetPayload<{
  select: typeof selectProductBasic;
}>;

export type ProductDetailResult = Prisma.ProductGetPayload<{
  select: typeof selectProductDetail;
}>;
export type ProductListResult = PaginatedResult<ProductBasicResult>;
