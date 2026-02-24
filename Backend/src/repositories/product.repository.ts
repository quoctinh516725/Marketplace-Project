import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { InputAll } from "../types";
import {
  ProductDetailResult,
  ProductListResult,
  selectProductBasic,
  selectProductDetail,
} from "../types/product.type";

class ProductRepository {
  getShopProducts = async (
    shopId: string,
    input: InputAll,
  ): Promise<ProductListResult> => {
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
        select: selectProductBasic,
        orderBy: { name: "asc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    return { data: products, total };
  };

  getAllProducts = async (input: InputAll): Promise<ProductListResult> => {
    const { page, limit, status } = input;

    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: selectProductBasic,
        orderBy: { name: "asc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    return { data: products, total };
  };

  getCategoryProducts = async (
    categoryId: string,
    input: InputAll,
  ): Promise<ProductListResult> => {
    const { page, limit, status, search } = input;

    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.ProductWhereInput = {
      ...(search && { name: { contains: search } }),
      ...(status && { status }),
      categoryId,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: selectProductBasic,
        orderBy: { name: "asc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    return { data: products, total };
  };

  getProductById = async (
    id: string,
    status?: string,
  ): Promise<ProductDetailResult | null> => {
    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
      id,
    };
    return await prisma.product.findFirst({
      where,
      select: selectProductDetail,
    });
  };
}
export default new ProductRepository();
