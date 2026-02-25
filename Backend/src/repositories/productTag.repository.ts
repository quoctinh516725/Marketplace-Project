import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";

export type CreateProductTagData = Prisma.ProductTagCreateInput;

class ProductTagRepository {
  async findById(id: string) {
    return prisma.productTag.findUnique({ where: { id } });
  }

  async findByIds(ids: string[]) {
    return prisma.tag.findMany({ where: { id: { in: ids } } });
  }

  async findByProductId(productId: string) {
    return prisma.productTag.findMany({
      where: { productId },
    });
  }

  async create(data: CreateProductTagData) {
    return prisma.productTag.create({
      data,
    });
  }

  async delete(id: string) {
    return prisma.productTag.delete({ where: { id } });
  }

  async deleteByProductId(productId: string) {
    return prisma.productTag.deleteMany({
      where: { productId },
    });
  }
}

export default new ProductTagRepository();
