import { Prisma } from "../../generated/prisma/client";
import { CategoryWhereInput } from "../../generated/prisma/models";
import { prisma } from "../config/prisma";
import { InputAll, PrismaType } from "../types";
import {
  CategoryAttributeResult,
  CategoryBasicResult,
  CategoryListResult,
  CategoryWithAttributesResult,
  selectCategoryAttribute,
  selectCategoryBasic,
  selectCategoryWithAttributes,
} from "../types/category.type";

interface CreateCategoryData {
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  level: number;
  sortOrder: number;
  isActive?: boolean;
}

type UpdateCategoryData = Prisma.CategoryUpdateInput;

class CategoryRepository {
  getAll = async (
    input: InputAll,
    isActive?: boolean,
  ): Promise<CategoryListResult> => {
    const { page, limit, search } = input;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.CategoryWhereInput = {
      ...(typeof isActive === "boolean" && { isActive }),
      ...(search && {
        name: {
          contains: search,
        },
      }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        select: selectCategoryBasic,
        skip,
        take,
        orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.category.count({ where }),
    ]);

    return { data: categories, total };
  };

  findById = async (id: string): Promise<CategoryBasicResult | null> => {
    return prisma.category.findUnique({
      where: { id },
      select: selectCategoryBasic,
    });
  };

  findByIdWithAttributes = async (
    id: string,
  ): Promise<CategoryWithAttributesResult | null> => {
    return prisma.category.findUnique({
      where: { id },
      select: selectCategoryWithAttributes,
    });
  };

  findBySlug = async (slug: string): Promise<CategoryBasicResult | null> => {
    return prisma.category.findUnique({
      where: { slug },
      select: selectCategoryBasic,
    });
  };

  findByIds = async (ids: string[]): Promise<CategoryBasicResult[]> => {
    return prisma.category.findMany({
      where: { id: { in: ids } },
      select: selectCategoryBasic,
    });
  };

  create = async (
    client: PrismaType,
    data: CreateCategoryData,
  ): Promise<CategoryBasicResult> => {
    return client.category.create({ data, select: selectCategoryBasic });
  };

  update = async (
    client: PrismaType,
    id: string,
    data: UpdateCategoryData,
  ): Promise<CategoryBasicResult> => {
    return client.category.update({
      where: { id },
      data,
      select: selectCategoryBasic,
    });
  };

  delete = async (
    client: PrismaType,
    id: string,
  ): Promise<CategoryBasicResult> => {
    return client.category.delete({
      where: { id },
      select: selectCategoryBasic,
    });
  };

  countChildren = async (id: string): Promise<number> => {
    return prisma.category.count({ where: { parentId: id } });
  };

  countProductCategories = async (id: string): Promise<number> => {
    return prisma.productCategory.count({ where: { categoryId: id } });
  };

  countCategoryAttributes = async (id: string): Promise<number> => {
    return prisma.categoryAttribute.count({ where: { categoryId: id } });
  };

  findCategoryAttribute = async (
    categoryId: string,
    attributeId: string,
  ): Promise<CategoryAttributeResult | null> => {
    return prisma.categoryAttribute.findFirst({
      where: { categoryId, attributeId },
      select: selectCategoryAttribute,
    });
  };

  getCategoryAttributes = async (
    categoryId: string,
  ): Promise<CategoryAttributeResult[]> => {
    return prisma.categoryAttribute.findMany({
      where: { categoryId },
      select: selectCategoryAttribute,
      orderBy: { attribute: { name: "asc" } },
    });
  };

  createCategoryAttribute = async (
    client: PrismaType,
    categoryId: string,
    attributeId: string,
  ): Promise<CategoryAttributeResult> => {
    return client.categoryAttribute.create({
      data: { categoryId, attributeId },
      select: selectCategoryAttribute,
    });
  };

  deleteCategoryAttribute = async (
    client: PrismaType,
    categoryId: string,
    attributeId: string,
  ): Promise<CategoryAttributeResult> => {
    const categoryAttribute = await client.categoryAttribute.findFirstOrThrow({
      where: { categoryId, attributeId },
      select: { id: true },
    });

    return client.categoryAttribute.delete({
      where: { id: categoryAttribute.id },
      select: selectCategoryAttribute,
    });
  };
  
  findAllForTree = async (data?: {
    isActive: boolean;
  }): Promise<CategoryBasicResult[]> => {
    return prisma.category.findMany({
      where: {
        ...(data?.isActive !== undefined && { isActive: data.isActive }),
      },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
      select: selectCategoryBasic,
    });
  };
}

export default new CategoryRepository();
