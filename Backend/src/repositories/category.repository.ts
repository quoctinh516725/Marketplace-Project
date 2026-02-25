import { Category } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";

interface CreateCategoryData {
  parentId: string | null;
  name: string;
  slug: string;
  description: string;
  level: number;
  sortOrder: number;
}

class CategoryRepository {
  findById = async (id: string): Promise<Category | null> => {
    return prisma.category.findUnique({ where: { id } });
  };

  findByIds = async (ids: string[]): Promise<Category[]> => {
    return prisma.category.findMany({ where: { id: { in: ids } } });
  };

  async create(data: CreateCategoryData) {
    return prisma.category.create({ data });
  }
}

export default new CategoryRepository();
