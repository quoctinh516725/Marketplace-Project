import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ProductStatus } from "../constants/productStatus";
import { InputAll, PrismaType } from "../types";
import {
  ProductBasicResult,
  ProductDetailResult,
  ProductListResult,
  ProductVariantResult,
  selectProductBasic,
  selectProductDetail,
  selectProductVariant,
} from "../types/product.type";

interface CreateProductData {
  shopId: string;
  brandId: string | null;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string;
  originalPrice: Prisma.Decimal | null;
  soldCount: number;
}

interface CreateProductVariantData {
  productId: string;
  sku: string;
  variantName: string;
  imageUrl: string | null;
  price: number;
  stock: number;
  weight: number;
}

interface CreateProductImageData {
  productId: string;
  imageUrl: string;
  sortOrder: number;
}

interface CreateProductAttributeData {
  productVariantId: string;
  attributeId: string;
  attributeValueId: string | null;
}
interface CreateAttributeValueData {
  attributeId: string;
  value: string;
}
interface CreateProductCategoryValueData {
  categoryId: string;
  productId: string;
}

interface CreateProductTagValueData {
  tagId: string;
  productId: string;
}

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
      deletedAt: null,
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
      deletedAt: null,
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
    const where: Prisma.ProductCategoryWhereInput = {
      categoryId,
      product: {
        ...(search && { name: { contains: search } }),
        ...(status && { status }),
        deletedAt: null,
      },
    };

    const [products, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        select: { product: { select: selectProductBasic } },
        orderBy: { product: { name: "asc" } },
        skip,
        take,
      }),
      prisma.productCategory.count({ where }),
    ]);

    const data = products.map((p) => p.product);

    return { data, total };
  };

  getProductBasicByIds = async (
    ids: string[],
  ): Promise<ProductBasicResult[]> => {
    return await prisma.product.findMany({
      where: { id: { in: ids } },
    });
  };

  getProductById = async (
    id: string,
    status?: string,
  ): Promise<ProductDetailResult | null> => {
    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
      id,
      deletedAt: null,
    };
    return await prisma.product.findFirst({
      where,
      select: selectProductDetail,
    });
  };

  getProductByIdAndShop = async (
    id: string,
    shopId: string,
  ): Promise<ProductBasicResult | null> => {
    return await prisma.product.findFirst({
      where: { id, shopId, deletedAt: null },
      select: selectProductBasic,
    });
  };

  getProductBySlug = async (
    slug: string,
    status?: string,
  ): Promise<ProductDetailResult | null> => {
    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
      slug,
      deletedAt: null,
    };
    return await prisma.product.findFirst({
      where,
      select: selectProductDetail,
    });
  };

  getProductCode = async (): Promise<string> => {
    const result = await prisma.$queryRaw<
      { value: string }[]
    >`SELECT NEXT VALUE FOR ProductSeq AS value`;

    return `PRD${result[0].value.toString().padStart(6, "0")}`;
  };

  getProductVariantById = async (
    id: string,
  ): Promise<ProductVariantResult | null> => {
    return await prisma.productVariant.findFirst({
      where: { id, status: ProductStatus.ACTIVE, deletedAt: null },
      select: selectProductVariant,
    });
  };

  getProductVariantByIds = async (
    ids: string[],
  ): Promise<ProductVariantResult[]> => {
    return await prisma.productVariant.findMany({
      where: { id: { in: ids }, status: ProductStatus.ACTIVE, deletedAt: null },
      select: selectProductVariant,
    });
  };

  createProduct = async (
    client: PrismaType,
    data: CreateProductData,
  ): Promise<ProductBasicResult> => {
    return await client.product.create({ data, select: selectProductBasic });
  };

  updateProduct = async (
    client: PrismaType,
    id: string,
    data: Prisma.ProductUpdateManyMutationInput,
  ): Promise<ProductBasicResult> => {
    return await client.product.update({
      where: { id },
      data,
      select: selectProductDetail,
    });
  };

  createProductVariant = async (
    client: PrismaType,
    data: CreateProductVariantData,
  ) => {
    return await client.productVariant.create({ data });
  };

  createProductImage = async (
    client: PrismaType,
    data: CreateProductImageData[],
  ) => {
    return await client.productImage.createMany({ data });
  };

  createProductAttribute = async (
    client: PrismaType,
    data: CreateProductAttributeData[],
  ) => {
    return await client.productAttribute.createMany({ data });
  };

  createProductCategory = async (
    client: PrismaType,
    data: CreateProductCategoryValueData[],
  ) => {
    return await client.productCategory.createMany({ data });
  };

  createProductTag = async (
    client: PrismaType,
    data: CreateProductTagValueData[],
  ) => {
    return await client.productTag.createMany({ data });
  };

  createAttributeValue = async (
    client: PrismaType,
    data: CreateAttributeValueData,
  ) => {
    return await client.attributeValue.create({ data });
  };
  updateThumbnail = async (
    client: PrismaType,
    id: string,
    thumbnailUrl: string,
  ): Promise<ProductBasicResult> => {
    return await client.product.update({
      where: { id },
      data: { thumbnailUrl },
      select: selectProductBasic,
    });
  };

  replaceProductImages = async (
    client: PrismaType,
    productId: string,
    data: CreateProductImageData[],
  ) => {
    await client.productImage.deleteMany({
      where: { productId },
    });

    if (data.length === 0) return;

    await client.productImage.createMany({ data });
  };

  deleteProduct = async (
    client: PrismaType,
    id: string,
  ): Promise<ProductBasicResult> => {
    return await client.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: selectProductBasic,
    });
  };

  deleteProductVariant = async (client: PrismaType, id: string) => {
    return await client.productVariant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  };

  updadeStatus = async (
    client: PrismaType,
    id: string,
    status: string,
  ): Promise<ProductBasicResult> => {
    return await client.product.update({
      where: { id },
      data: { status },
      select: selectProductBasic,
    });
  };
}
export default new ProductRepository();
