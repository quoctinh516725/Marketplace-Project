import { prisma } from "../config/prisma";

export interface CreateBrandData {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateBrandData {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

class BrandRepository {
  async findById(id: string) {
    return prisma.brand.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return prisma.brand.findUnique({ where: { slug } });
  }

  async findAll() {
    return prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
  }

  async create(data: CreateBrandData) {
    return prisma.brand.create({
      data,
    });
  }

  async update(id: string, data: UpdateBrandData) {
    return prisma.brand.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.brand.delete({ where: { id } });
  }
}

export default new BrandRepository();
