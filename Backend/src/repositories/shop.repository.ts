import { Prisma, Shop } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ShopStatus } from "../constants/shopStatus";
import { InputAll, PrismaType } from "../types";
import {
  ShopDetailResult,
  ShopListResult,
  toShopDetailResult,
} from "../types/shop.type";

export interface CreateShopData {
  name: string;
  address: string;
  phone: string;
  slug: string;
  description?: string;
}

export interface UpdateShopData extends Partial<CreateShopData> {
  status?: ShopStatus;
  logoUrl?: string;
  backgroundUrl?: string;
}

class ShopRepository {
  getAll = async (input: InputAll): Promise<ShopListResult> => {
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
    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.shop.count({ where }),
    ]);

    const data = shops.map(toShopDetailResult);

    return {
      data,
      total,
    };
  };

  create = async (
    sellerId: string,
    data: CreateShopData,
  ): Promise<ShopDetailResult> => {
    const shop = await prisma.shop.create({ data: { ...data, sellerId } });
    return toShopDetailResult(shop);
  };
  update = async (
    client: PrismaType,
    id: string,
    data: UpdateShopData,
  ): Promise<ShopDetailResult> => {
    const shop = await client.shop.update({ where: { id }, data });
    return toShopDetailResult(shop);
  };

  findShopBySeller = async (
    sellerId: string,
  ): Promise<ShopDetailResult | null> => {
    const shop = await prisma.shop.findUnique({ where: { sellerId } });
    return shop ? toShopDetailResult(shop) : null;
  };

  findShopById = async (id: string): Promise<ShopDetailResult | null> => {
    const shop = await prisma.shop.findUnique({ where: { id } });
    return shop ? toShopDetailResult(shop) : null;
  };

  findBySlug = async (slug: string): Promise<ShopDetailResult | null> => {
    const shop = await prisma.shop.findFirst({ where: { slug } });
    return shop ? toShopDetailResult(shop) : null;
  };
}

export default new ShopRepository();
