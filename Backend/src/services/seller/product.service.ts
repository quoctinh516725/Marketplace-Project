import { Prisma } from "../../../generated/prisma/client";
import { CacheKey } from "../../cache/cache.key";
import cacheTag from "../../cache/cache.tag";
import { CacheTTL } from "../../cache/cache.ttl";
import { prisma } from "../../config/prisma";
import { ProductStatus } from "../../constants/productStatus";
import { ShopStatus } from "../../constants/shopStatus";
import { CreateProductRequestData } from "../../dtos/product";
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
        const products = await productRepository.getShopProducts(shop.id, input);

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
  ): Promise<ProductBasicResponseDto> => {
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

    let product: ReturnType<typeof toProductPublicResponse> | null = null;
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
        for (let variantIndex = 0; variantIndex < data.variants.length; variantIndex++) {
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
                const attributeValue = await attributeValueRepository.findByValue(
                  tx,
                  attribute.attributeId,
                  valueNormalized,
                );
                listValue.push(valueNormalized);

                if (!attributeValue) {
                  const newAttributeValue = await attributeValueRepository.create(
                    tx,
                    {
                      attributeId: attribute.attributeId,
                      value: valueNormalized,
                    },
                  );
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
      product = toProductPublicResponse(newProduct);
    } catch (error) {
      this.handleUniqueError(error);
    }

    //invalidate product:list/shopId
    await Promise.all([
      cacheTag.invalidateTag(`product:list`),
      cacheTag.invalidateTag(`product:shop:${shopId}`),
    ]);

    if (!product) {
      throw new ConflictError("Tạo sản phẩm thất bại, vui lòng thử lại!");
    }
    return product;
  };
}

export default new ProductService();
