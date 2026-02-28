import { Prisma, Shop } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ShopStatus } from "../constants/shopStatus";
import { InputAll, PrismaType } from "../types";
import {
  selectShopDetail,
  selectShopPublic,
  ShopDetailResult,
  ShopListResult,
  ShopPublicResult,
} from "../types/shop.type";

export interface CreateShopData {
  name: string;
  address: string;
  phone: string;
  slug: string;
  description?: string;
}

export type UpdateShopData = Prisma.ShopUpdateInput;

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
        select: selectShopDetail,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.shop.count({ where }),
    ]);
    return {
      data: shops,
      total,
    };
  };

  create = async (
    sellerId: string,
    data: CreateShopData,
  ): Promise<ShopDetailResult> => {
    return await prisma.shop.create({
      data: { ...data, sellerId },
      select: selectShopDetail,
    });
  };

  update = async (
    client: PrismaType,
    id: string,
    data: UpdateShopData,
  ): Promise<ShopDetailResult> => {
    return await client.shop.update({
      where: { id },
      data,
      select: selectShopDetail,
    });
  };

  findShopBySeller = async (
    sellerId: string,
  ): Promise<ShopDetailResult | null> => {
    return await prisma.shop.findUnique({
      where: { sellerId },
      select: selectShopDetail,
    });
  };

  findShopById = async (id: string): Promise<ShopDetailResult | null> => {
    return await prisma.shop.findUnique({
      where: { id },
      select: selectShopDetail,
    });
  };

  findBySlug = async (slug: string): Promise<ShopPublicResult | null> => {
    return await prisma.shop.findFirst({
      where: { slug },
      select: selectShopPublic,
    });
  };
}

export default new ShopRepository();
