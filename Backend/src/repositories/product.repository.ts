import { Prisma, Product } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { PaginatedResponseDto } from "../dtos";
import { InputAll } from "../types";

export type ProductAllResponse = PaginatedResponseDto<Product>;

class ProductRepository {
  getShopProducts = async (
    shopId: string,
    input: InputAll,
  ): Promise<ProductAllResponse> => {
    const { page, limit, search, status } = input;

    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.ProductWhereInput = {
      ...(search && {
        name: {
          contains: search,
        },
      }),
      ...(status && { status }),
      shopId,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
      },
    };
  };
  getAllProducts = async (input: InputAll): Promise<ProductAllResponse> => {
    const { page, limit, status } = input;

    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
      },
    };
  };
}
export default new ProductRepository();
