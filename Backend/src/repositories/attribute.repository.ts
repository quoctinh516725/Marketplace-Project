import { prisma } from "../config/prisma";
import { PrismaType } from "../types";

export interface CreateAttributeData {
  attributeName: string;
  name: string;
  code: string;
  description?: string;
}

export interface UpdateAttributeData {
  attributeName?: string;
  code?: string;
  description?: string;
}

class AttributeRepository {
  async findById(id: string) {
    return prisma.attribute.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return prisma.attribute.findUnique({ where: { code } });
  }

  async findAll() {
    return prisma.attribute.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findByCategoryIds(client: PrismaType, categoryIds: string[]) {
    return client.categoryAttribute.findMany({
      where: { categoryId: { in: categoryIds } },
    });
  }

  async create(data: CreateAttributeData) {
    return prisma.attribute.create({
      data,
    });
  }

  async update(id: string, data: UpdateAttributeData) {
    return prisma.attribute.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.attribute.delete({ where: { id } });
  }
}

export default new AttributeRepository();
