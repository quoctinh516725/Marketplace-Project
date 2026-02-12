import { constants } from "node:buffer";
import { Prisma, Shop } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ShopStatus } from "../constants/shopStatus";
import { ConflictError } from "../error/AppError";
import { InputAll, PrismaType } from "../types";
import { PaginatedResponse } from "../types/pagination.type";

export interface CreateShop {
  name: string;
  address: string;
  phone: string;
  slug: string;
  description?: string;
}

export interface UpdateShop extends Partial<CreateShop> {
  status?: ShopStatus;
  logoUrl?: string;
  backgroundUrl?: string;
}

export type ShopAllResponse = PaginatedResponse<Shop>;

class ShopRepository {
  getAll = async (input: InputAll): Promise<ShopAllResponse> => {
    const { status, page, limit, search } = input;

    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.ShopWhereInput = {
      ...(status && { status }),
      ...(search && {
        name: {
          contains: search,
        },
      }),
    };
    const [data, total] = await Promise.all([
      prisma.shop.findMany({ where, skip, orderBy: { name: "asc" }, take }),
      prisma.shop.count({ where }),
    ]);

    return {
      data,
      pagination: {
        limit,
        page,
        total,
      },
    };
  };

  create = async (sellerId: string, data: CreateShop): Promise<Shop> => {
    return await prisma.shop.create({ data: { ...data, sellerId } });
  };
  update = async (
    client: PrismaType,
    id: string,
    data: UpdateShop,
  ): Promise<Shop> => {
    return await client.shop.update({ where: { id }, data });
  };

  findShopBySeller = async (sellerId: string): Promise<Shop | null> => {
    return await prisma.shop.findUnique({ where: { sellerId } });
  };

  findShopById = async (id: string): Promise<Shop | null> => {
    return await prisma.shop.findUnique({ where: { id } });
  };

  findBySlug = async (slug: string): Promise<Shop | null> => {
    return await prisma.shop.findFirst({ where: { slug } });
  };
}

export default new ShopRepository();
