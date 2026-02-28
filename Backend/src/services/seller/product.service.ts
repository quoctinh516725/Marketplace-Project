import { Prisma } from "../../../generated/prisma/client";
import { CacheKey } from "../../cache/cache.key";
import cacheTag from "../../cache/cache.tag";
import { CacheTTL } from "../../cache/cache.ttl";
import { esClient } from "../../config/elasticsearch";
import { prisma } from "../../config/prisma";
import { ProductStatus } from "../../constants/productStatus";
import { ShopStatus } from "../../constants/shopStatus";
import {
  CreateProductRequestData,
  UpdateProductRequestData,
} from "../../dtos/product";
import {
  toProductDetailManageResponse,
  toProductPublicResponse,
} from "../../dtos/product/mapper.dto";
import {
  ProductBasicResponseDto,
  ProductDetailManageResponseDto,
  ProductListManageResponseDto,
} from "../../dtos/product/product.response.dto";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import attributeRepository from "../../repositories/attribute.repository";
import attributeValueRepository from "../../repositories/attributeValue.repository";
import brandRepository from "../../repositories/brand.repository";
import categoryRepository from "../../repositories/category.repository";
import productRepository from "../../repositories/product.repository";
import productTagRepository from "../../repositories/productTag.repository";
import shopRepository from "../../repositories/shop.repository";
import { InputAll } from "../../types";
import { cacheAsync } from "../../utils/cache";
import { generateSlug, normalizeText } from "../../utils/generate";
import { uploadStream } from "../../utils/uploadStream";

class ProductService {
  private handleUniqueError = (error: unknown): never => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(",")
        : String(error.meta?.target ?? "");

      if (target.includes("slug")) {
        throw new ConflictError("Slug đã tồn tại trong hệ thống!");
      }
      if (target.includes("code")) {
        throw new ConflictError("Mã sản phẩm đã tồn tại trong hệ thống!");
      }
      if (target.includes("sku")) {
        throw new ConflictError("SKU biến thể bị trùng, vui lòng thử lại!");
      }

      throw new ConflictError("Dữ liệu bị trùng, vui lòng thử lại!");
    }

    throw error;
  };

  private invalidateProductCache = async (
    shopId: string,
    productId: string,
  ) => {
    const tags = [
      "product:list",
      `product:shop:${shopId}`,
      `product:${productId}`,
    ];

    await Promise.all(tags.map((tag) => cacheTag.invalidateTag(tag)));
  };

  private validateShopProduct = async (shopId: string, productId: string) => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) throw new NotFoundError("Cua hang khong ton tai!");
    if (shop.status !== ShopStatus.ACTIVE)
      throw new ForbiddenError("Cua hang khong hoat dong!");

    const product = await productRepository.getProductByIdAndShop(
      productId,
      shopId,
    );
    if (!product) throw new NotFoundError("San pham khong ton tai!");

    return { shop, product };
  };

  getMyProducts = async (
    shopId: string,
    input: InputAll,
  ): Promise<ProductListManageResponseDto> => {
    return cacheAsync(
      CacheKey.product.seller.shopProducts(input, shopId),
      CacheTTL.product.list,
      [`product:shop:${shopId}`],
      async () => {
        if (
          input.status &&
          !Object.values(ProductStatus).includes(input.status as ProductStatus)
        ) {
          throw new ValidationError("Trạng thái không hợp lệ!");
        }
        const shop = await shopRepository.findShopById(shopId);
        if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");
        const products = await productRepository.getShopProducts(
          shop.id,
          input,
        );

        const data = {
          data: products.data.map(toProductPublicResponse),
          pagination: {
            page: input.page,
            limit: input.limit,
            total: products.total,
          },
        };
        return { data };
      },
    );
  };

  // Get my product by ID
  getMyProductById = async (
    id: string,
    shopId: string,
  ): Promise<ProductDetailManageResponseDto> => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");

    const product = await productRepository.getProductById(id);
    if (!product) throw new NotFoundError("Sản phẩm không tồn tại!");

    if (
      product.status !== ProductStatus.ACTIVE &&
      product.shop.id !== shop.id
    ) {
      throw new ForbiddenError("Không thể lấy sản phẩm của cửa hàng khác!");
    }
    return toProductDetailManageResponse(product);
  };

  // Create Product
  create = async (
    shopId: string,
    data: CreateProductRequestData,
  ): Promise<ProductDetailManageResponseDto> => {
    //Verify Shop exist
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");
    if (shop.status !== ShopStatus.ACTIVE)
      throw new ForbiddenError("Cửa hàng không hoạt động!");

    //Category
    const inputCategoryIds = [...new Set(data.categories.map((c) => c.id))];
    const categories = await categoryRepository.findByIds(inputCategoryIds);
    if (categories.length < inputCategoryIds.length)
      throw new NotFoundError("Danh mục không tồn tại!");

    //Tag
    const inputTagIds = [...new Set(data.tags.map((t) => t.id))];
    const tags = await productTagRepository.findByIds(inputTagIds);
    if (tags.length < inputTagIds.length)
      throw new NotFoundError("Thẻ không tồn tại!");

    //Brand if provide
    if (data.brandId) {
      const brand = await brandRepository.findById(data.brandId);
      if (!brand) throw new NotFoundError("Thương hiệu không tồn tại!");
    }

    //Generate Slug if not provide
    const slug = data.slug ?? generateSlug(data.name);
    const slugExist = await productRepository.getProductBySlug(slug);
    if (slugExist) throw new ConflictError("Slug đã tồn tại trong hệ thống!");

    //Check variants must provide
    if (!data.variants || data.variants.length === 0)
      throw new ValidationError("Phải có ít nhất một biến thể!");

    const productCode = await productRepository.getProductCode();

    let product: ReturnType<typeof toProductDetailManageResponse> | null = null;
    try {
      //create product + image + variant + tags + update total product shop
      const newProduct = await prisma.$transaction(async (tx) => {
        // Create Product
        const newProduct = await productRepository.createProduct(tx, {
          shopId,
          brandId: data.brandId ?? null,
          name: data.name,
          code: productCode,
          slug,
          description: data.description,
          thumbnailUrl: data.thumbnailUrl,
          soldCount: data.soldCount,
          originalPrice: data.originalPrice
            ? new Prisma.Decimal(data.originalPrice)
            : null,
        });

        // Create Poduct Image
        if (data.images && data.images.length > 0) {
          await productRepository.createProductImage(
            tx,
            data.images.map((i) => ({
              imageUrl: i.imageUrl,
              productId: newProduct.id,
              sortOrder: i.sortOrder,
            })),
          );
        }

        // Create Product Category
        if (data.categories && data.categories.length > 0) {
          await productRepository.createProductCategory(
            tx,
            data.categories.map((c) => ({
              categoryId: c.id,
              productId: newProduct.id,
            })),
          );
        }

        // Create Product Tag
        if (data.tags && data.tags.length > 0) {
          await productRepository.createProductTag(
            tx,
            data.tags.map((t) => ({
              tagId: t.id,
              productId: newProduct.id,
            })),
          );
        }

        // Validate Attribute
        const categoryAttributes = await attributeRepository.findByCategoryIds(
          tx,
          data.categories.map((c) => c.id),
        );

        const allowedAttribute = new Set(
          categoryAttributes.map((c) => c.attributeId),
        );
        const usedSkus = new Set<string>();

        // Create Product Variant
        for (
          let variantIndex = 0;
          variantIndex < data.variants.length;
          variantIndex++
        ) {
          const variant = data.variants[variantIndex];
          // Validate Attribute
          let listValue: string[] = [];
          if (variant.attributes && variant.attributes.length > 0) {
            for (const attribute of variant.attributes) {
              if (!allowedAttribute.has(attribute.attributeId)) {
                throw new ValidationError(
                  `Thuộc tính ${attribute.attributeId} không được phép gán cho danh mục này`,
                );
              }

              if (attribute.value) {
                const valueNormalized = normalizeText(attribute.value);
                const attributeValue =
                  await attributeValueRepository.findByValue(
                    tx,
                    attribute.attributeId,
                    valueNormalized,
                  );
                listValue.push(valueNormalized);

                if (!attributeValue) {
                  const newAttributeValue =
                    await attributeValueRepository.create(tx, {
                      attributeId: attribute.attributeId,
                      value: valueNormalized,
                    });
                  attribute.attributeValueId = newAttributeValue.id;
                } else {
                  attribute.attributeValueId = attributeValue.id;
                }
              }
            }
          }

          // Variant Name
          const variantName =
            listValue.length > 0
              ? `${listValue.join("-")}`.toUpperCase()
              : `VARIANT-${variantIndex + 1}`;

          // SKU
          const baseSku = normalizeText(`${newProduct.code}-${variantName}`);
          let sku = baseSku;
          let suffix = 1;

          while (usedSkus.has(sku)) {
            suffix += 1;
            sku = `${baseSku}-${suffix}`;
          }

          usedSkus.add(sku);

          // Create Variant
          const newVariant = await productRepository.createProductVariant(tx, {
            imageUrl: variant.imageUrl,
            price: variant.price,
            productId: newProduct.id,
            sku,
            stock: variant.stock,
            variantName,
            weight: variant.weight,
          });

          // Create Variant Attribut Value
          await productRepository.createProductAttribute(
            tx,
            variant.attributes.map((attr) => ({
              productVariantId: newVariant.id,
              attributeId: attr.attributeId,
              attributeValueId: attr.attributeValueId,
            })),
          );
        }

        await shopRepository.update(tx, shopId, {
          totalProducts: {
            increment: 1,
          },
        });

        return newProduct;
      });
      const newProductDetail = await productRepository.getProductById(
        newProduct.id,
      );
      product = toProductDetailManageResponse(newProductDetail!);
    } catch (error) {
      this.handleUniqueError(error);
    }

    if (!product) {
      throw new ConflictError("Tạo sản phẩm thất bại, vui lòng thử lại!");
    }

    //invalidate product:list/shopId
    await Promise.all([
      cacheTag.invalidateTag(`product:list`),
      cacheTag.invalidateTag(`product:shop:${shopId}`),
    ]);

    // Add index search
    await esClient.index({
      index: "products",
      id: product.id,
      document: {
        name: product.name,
        description: product.description,
        price: product.originalPrice,
        soldCount: product.soldCount,
        rating: product.rating,
        categoryIds: product.categories.map((c) => c.id),
        shopId: product.shop.id,
        createdAt: product.createdAt,
        status: product.status,
        code: product.code,
        slug: product.slug,
        thumbnailUrl: product.thumbnailUrl,
      },
    });
    return product;
  };

  update = async (
    id: string,
    shopId: string,
    data: UpdateProductRequestData,
  ): Promise<ProductBasicResponseDto> => {
    if (data.brandId) {
      const brand = await brandRepository.findById(data.brandId);
      if (!brand) throw new NotFoundError("Thuong hieu khong ton tai!");
    }
    const { product } = await this.validateShopProduct(shopId, id);
    if (data.slug !== undefined || data.name !== undefined) {
      const slug = data.slug ?? generateSlug(data.name ?? product.name);
      const slugExist = await productRepository.getProductBySlug(slug);
      if (slugExist && slugExist.id !== product.id) {
        throw new ConflictError("Slug da ton tai trong he thong!");
      }
      data.slug = slug;
    }

    let productUpdated: ProductBasicResponseDto | null = null;
    try {
      const result = await productRepository.updateProduct(
        prisma,
        id,
        shopId,
        data,
      );

      productUpdated = toProductPublicResponse(result);
    } catch (error) {
      this.handleUniqueError(error);
    }

    if (!productUpdated) {
      throw new ConflictError("Cap nhat san pham that bai, vui long thu lai!");
    }

    await Promise.all([
      cacheTag.invalidateTag("product:list"),
      cacheTag.invalidateTag(`product:shop:${shopId}`),
      cacheTag.invalidateTag(`product:${id}`),
    ]);

    // Update doc
    const doc: any = {};

    if (data.name !== undefined) doc.name = data.name;
    if (data.description !== undefined) doc.description = data.description;
    if (data.originalPrice !== undefined) doc.price = data.originalPrice;
    if (data.soldCount !== undefined) doc.soldCount = data.soldCount;
    if (data.slug !== undefined) doc.slug = data.slug;

    if (Object.keys(doc).length > 0) {
      await esClient.update({
        index: "products",
        id,
        doc,
      });
    }
    return productUpdated;
  };

  uploadThumbnail = async (
    shopId: string,
    file: Express.Multer.File,
    productId: string,
  ): Promise<{ url: string; public_id: string }> => {
    await this.validateShopProduct(shopId, productId);

    const result: any = await uploadStream(file, {
      folder: `marketplace/shop/${shopId}/products/thumbnail`,
      ...(productId
        ? {
            publicId: `product-${productId}-thumbnail`,
            overwrite: true,
          }
        : {}),
    });

    await productRepository.updateThumbnail(
      prisma,
      productId,
      result.secure_url,
    );
    await this.invalidateProductCache(shopId, productId);
    await esClient.update({
      index: "products",
      id: productId,
      doc: { thumbnailUrl: result.secure_url },
    });

    return { url: result.secure_url, public_id: result.public_id };
  };

  uploadImages = async (
    shopId: string,
    files: Express.Multer.File[],
    productId: string,
  ): Promise<{ url: string; public_id: string; sortOrder: number }[]> => {
    const { product } = await this.validateShopProduct(shopId, productId);

    const uploads = await Promise.all(
      files.map(async (file, index) => {
        const result: any = await uploadStream(file, {
          folder: `marketplace/shop/${shopId}/products/images`,
        });
        return {
          url: result.secure_url,
          public_id: result.public_id,
          sortOrder: index,
        };
      }),
    );

    await prisma.$transaction(async (tx) => {
      await productRepository.replaceProductImages(
        tx,
        productId,
        uploads.map((upload) => ({
          productId,
          imageUrl: upload.url,
          sortOrder: upload.sortOrder,
        })),
      );
    });
    await this.invalidateProductCache(shopId, productId);

    return uploads;
  };

  deleteProduct = async (
    shopId: string,
    productId: string,
  ): Promise<ProductBasicResponseDto> => {
    await this.validateShopProduct(shopId, productId);

    const productDeleted = await prisma.$transaction(async (tx) => {
      const product = await productRepository.deleteProduct(tx, productId);

      // Update Shop Total Product
      await shopRepository.update(tx, shopId, {
        totalProducts: { decrement: 1 },
      });

      // Update Product Status
      return await productRepository.updadeStatus(
        tx,
        productId,
        ProductStatus.DELETED,
      );
    });

    await this.invalidateProductCache(shopId, productId);

    // Delete Index
    await esClient.delete({
      index: "products",
      id: productId,
    });

    return toProductPublicResponse(productDeleted);
  };

  updateProductStatus = async (
    shopId: string,
    productId: string,
    status: string,
  ): Promise<ProductBasicResponseDto> => {
    await this.validateShopProduct(shopId, productId);

    const productUpdated = await productRepository.updadeStatus(
      prisma,
      productId,
      status,
    );

    await this.invalidateProductCache(shopId, productId);
    await esClient.update({
      index: "products",
      id: productId,
      doc: { status },
    });
    return toProductPublicResponse(productUpdated);
  };
}

export default new ProductService();
