import { prisma } from "../config/prisma";
import { PrismaType } from "../types";

export interface CreateAttributeValueData {
  attributeId: string;
  value: string;
}

export interface UpdateAttributeValueData {
  value?: string;
}

class AttributeValueRepository {
  async findById(id: string) {
    return prisma.attributeValue.findUnique({
      where: { id },
      include: {
        attribute: true,
      },
    });
  }

  async findByAttributeId(attributeId: string) {
    return prisma.attributeValue.findMany({
      where: { attributeId },
      orderBy: { value: "asc" },
    });
  }

  async findByValue(client: PrismaType, attributeId: string, value: string) {
    return client.attributeValue.findFirst({
      where: { value, attributeId },
    });
  }

  async create(client: PrismaType, data: CreateAttributeValueData) {
    return client.attributeValue.create({
      data,
    });
  }

  async createMany(values: CreateAttributeValueData[]) {
    return prisma.attributeValue.createMany({
      data: values,
      skipDuplicates: true as never,
    });
  }

  async update(id: string, data: UpdateAttributeValueData) {
    return prisma.attributeValue.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.attributeValue.delete({ where: { id } });
  }

  async deleteByAttributeId(attributeId: string) {
    return prisma.attributeValue.deleteMany({
      where: { attributeId },
    });
  }
}

export default new AttributeValueRepository();
