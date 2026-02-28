import { Prisma } from "../../generated/prisma/client";
import { PaginatedResult } from "../dtos";

export const selectCategoryBasic = {
  id: true,
  parentId: true,
  name: true,
  slug: true,
  description: true,
  level: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

export const selectCategoryWithAttributes = {
  ...selectCategoryBasic,
  categoryAttributes: {
    select: {
      id: true,
      categoryId: true,
      attributeId: true,
      attribute: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
        },
      },
    },
  },
} satisfies Prisma.CategorySelect;

export const selectCategoryAttribute = {
  id: true,
  categoryId: true,
  attributeId: true,
  attribute: {
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
    },
  },
} satisfies Prisma.CategoryAttributeSelect;

export type CategoryBasicResult = Prisma.CategoryGetPayload<{
  select: typeof selectCategoryBasic;
}>;

export type CategoryTreeResult = CategoryBasicResult & {
  children: CategoryTreeResult[];
};

export type CategoryWithAttributesResult = Prisma.CategoryGetPayload<{
  select: typeof selectCategoryWithAttributes;
}>;

export type CategoryAttributeResult = Prisma.CategoryAttributeGetPayload<{
  select: typeof selectCategoryAttribute;
}>;

export type CategoryListResult = PaginatedResult<CategoryBasicResult>;
