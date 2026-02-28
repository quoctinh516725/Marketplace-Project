import { Prisma } from "../generated/prisma/client";
import { prisma } from "../src/config/prisma";
import { UserRole } from "../src/constants";
import { ProductStatus } from "../src/constants/productStatus";
import { ShopStatus } from "../src/constants/shopStatus";

type SeedVariant = {
  sku: string;
  variantName: string;
  imageUrl: string;
  price: number;
  stock: number;
  weight?: number;
  attributes: Array<{
    code: string;
    value: string;
  }>;
};

type SeedProduct = {
  code: string;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  originalPrice: number;
  soldCount: number;
  categorySlugs: string[];
  tagNames: string[];
  images: string[];
  variants: SeedVariant[];
};

async function findOrCreateTag(name: string) {
  const existing = await prisma.tag.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.tag.create({ data: { name } });
}

async function assignCategoryAttribute(categoryId: string, attributeId: string) {
  const existing = await prisma.categoryAttribute.findFirst({
    where: { categoryId, attributeId },
  });
  if (existing) return existing;
  return prisma.categoryAttribute.create({
    data: { categoryId, attributeId },
  });
}

async function assignProductCategory(productId: string, categoryId: string) {
  const existing = await prisma.productCategory.findFirst({
    where: { productId, categoryId },
  });
  if (existing) return existing;
  return prisma.productCategory.create({
    data: { productId, categoryId },
  });
}

async function assignProductTag(productId: string, tagId: string) {
  const existing = await prisma.productTag.findFirst({
    where: { productId, tagId },
  });
  if (existing) return existing;
  return prisma.productTag.create({
    data: { productId, tagId },
  });
}

async function upsertProductAttribute(
  productVariantId: string,
  attributeId: string,
  attributeValueId: string,
) {
  const existing = await prisma.productAttribute.findFirst({
    where: { productVariantId, attributeId },
  });

  if (existing) {
    return prisma.productAttribute.update({
      where: { id: existing.id },
      data: { attributeValueId },
    });
  }

  return prisma.productAttribute.create({
    data: {
      productVariantId,
      attributeId,
      attributeValueId,
    },
  });
}

async function seedProducts() {
  console.log("🌱 Seeding products...");

  try {
    const sellerRole = await prisma.role.findUnique({
      where: { code: UserRole.SELLER },
    });

    if (!sellerRole) {
      throw new Error(
        "Role SELLER not found. Run prisma/seed.ts (roles/permissions) first.",
      );
    }

    const seller = await prisma.user.upsert({
      where: { email: "seller.seed@marketplace.local" },
      update: {
        username: "seller_seed",
        fullName: "Seed Seller",
        status: "ACTIVE",
      },
      create: {
        email: "seller.seed@marketplace.local",
        username: "seller_seed",
        password: "$2b$10$9Qf5a5blNQSkP0uN9W5m2eMCZlG8wye4f1fE8K4r9Q4MC8fIvYQ1q", // seed-password
        fullName: "Seed Seller",
        status: "ACTIVE",
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: seller.id,
          roleId: sellerRole.id,
        },
      },
      update: {},
      create: {
        userId: seller.id,
        roleId: sellerRole.id,
      },
    });

    const shop = await prisma.shop.upsert({
      where: { sellerId: seller.id },
      update: {
        name: "Seed Shop",
        status: ShopStatus.ACTIVE,
      },
      create: {
        sellerId: seller.id,
        name: "Seed Shop",
        address: "123 Seed Street, Ho Chi Minh City",
        phone: "0900000000",
        slug: "seed-shop",
        description: "Shop duoc tao de seed du lieu san pham",
        logoUrl: "https://picsum.photos/seed/shop-logo/400/400",
        backgroundUrl: "https://picsum.photos/seed/shop-bg/1200/400",
        status: ShopStatus.ACTIVE,
      },
    });

    const brandApple = await prisma.brand.upsert({
      where: { slug: "apple" },
      update: { name: "Apple" },
      create: {
        name: "Apple",
        slug: "apple",
        description: "Apple Inc.",
        logoUrl: "https://picsum.photos/seed/brand-apple/300/300",
      },
    });

    const brandSamsung = await prisma.brand.upsert({
      where: { slug: "samsung" },
      update: { name: "Samsung" },
      create: {
        name: "Samsung",
        slug: "samsung",
        description: "Samsung Electronics",
        logoUrl: "https://picsum.photos/seed/brand-samsung/300/300",
      },
    });

    const categoryPhones = await prisma.category.upsert({
      where: { slug: "dien-thoai" },
      update: {
        name: "Dien thoai",
        isActive: true,
      },
      create: {
        name: "Dien thoai",
        slug: "dien-thoai",
        description: "Danh muc dien thoai",
        level: 0,
        sortOrder: 1,
        isActive: true,
      },
    });

    const tagHot = await findOrCreateTag("Hot");
    const tagNew = await findOrCreateTag("New");
    const tagOfficial = await findOrCreateTag("Official");

    const attrColor = await prisma.attribute.upsert({
      where: { code: "COLOR" },
      update: { name: "Mau sac" },
      create: {
        code: "COLOR",
        name: "Mau sac",
        description: "Mau cua san pham",
      },
    });

    const attrStorage = await prisma.attribute.upsert({
      where: { code: "STORAGE" },
      update: { name: "Bo nho" },
      create: {
        code: "STORAGE",
        name: "Bo nho",
        description: "Dung luong bo nho",
      },
    });

    await assignCategoryAttribute(categoryPhones.id, attrColor.id);
    await assignCategoryAttribute(categoryPhones.id, attrStorage.id);

    const products: SeedProduct[] = [
      {
        code: "SEED-PRD-001",
        name: "iPhone 15",
        slug: "iphone-15-seed",
        description: "iPhone 15 seed data",
        thumbnailUrl: "https://picsum.photos/seed/iphone15-thumb/800/800",
        originalPrice: 22990000,
        soldCount: 24,
        categorySlugs: ["dien-thoai"],
        tagNames: ["Hot", "New", "Official"],
        images: [
          "https://picsum.photos/seed/iphone15-1/1200/1200",
          "https://picsum.photos/seed/iphone15-2/1200/1200",
        ],
        variants: [
          {
            sku: "SEED-IP15-128-BLACK",
            variantName: "BLACK-128GB",
            imageUrl: "https://picsum.photos/seed/iphone15-black/800/800",
            price: 21990000,
            stock: 50,
            weight: 0.3,
            attributes: [
              { code: "COLOR", value: "Black" },
              { code: "STORAGE", value: "128GB" },
            ],
          },
          {
            sku: "SEED-IP15-256-BLUE",
            variantName: "BLUE-256GB",
            imageUrl: "https://picsum.photos/seed/iphone15-blue/800/800",
            price: 24990000,
            stock: 35,
            weight: 0.3,
            attributes: [
              { code: "COLOR", value: "Blue" },
              { code: "STORAGE", value: "256GB" },
            ],
          },
        ],
      },
      {
        code: "SEED-PRD-002",
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24-seed",
        description: "Samsung Galaxy S24 seed data",
        thumbnailUrl: "https://picsum.photos/seed/s24-thumb/800/800",
        originalPrice: 19990000,
        soldCount: 16,
        categorySlugs: ["dien-thoai"],
        tagNames: ["Hot", "Official"],
        images: [
          "https://picsum.photos/seed/s24-1/1200/1200",
          "https://picsum.photos/seed/s24-2/1200/1200",
        ],
        variants: [
          {
            sku: "SEED-S24-256-BLACK",
            variantName: "BLACK-256GB",
            imageUrl: "https://picsum.photos/seed/s24-black/800/800",
            price: 18990000,
            stock: 45,
            weight: 0.29,
            attributes: [
              { code: "COLOR", value: "Black" },
              { code: "STORAGE", value: "256GB" },
            ],
          },
          {
            sku: "SEED-S24-512-VIOLET",
            variantName: "VIOLET-512GB",
            imageUrl: "https://picsum.photos/seed/s24-violet/800/800",
            price: 21990000,
            stock: 20,
            weight: 0.29,
            attributes: [
              { code: "COLOR", value: "Violet" },
              { code: "STORAGE", value: "512GB" },
            ],
          },
        ],
      },
    ];

    for (const item of products) {
      const brandId = item.code === "SEED-PRD-001" ? brandApple.id : brandSamsung.id;

      const product = await prisma.product.upsert({
        where: { code: item.code },
        update: {
          shopId: shop.id,
          brandId,
          name: item.name,
          slug: item.slug,
          description: item.description,
          thumbnailUrl: item.thumbnailUrl,
          originalPrice: new Prisma.Decimal(item.originalPrice),
          soldCount: item.soldCount,
          status: ProductStatus.ACTIVE,
          deletedAt: null,
        },
        create: {
          code: item.code,
          shopId: shop.id,
          brandId,
          name: item.name,
          slug: item.slug,
          description: item.description,
          thumbnailUrl: item.thumbnailUrl,
          originalPrice: new Prisma.Decimal(item.originalPrice),
          soldCount: item.soldCount,
          status: ProductStatus.ACTIVE,
        },
      });

      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: item.images.map((imageUrl, index) => ({
          productId: product.id,
          imageUrl,
          sortOrder: index,
        })),
      });

      for (const categorySlug of item.categorySlugs) {
        const category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });
        if (!category) {
          throw new Error(`Category not found for slug: ${categorySlug}`);
        }
        await assignProductCategory(product.id, category.id);
      }

      for (const tagName of item.tagNames) {
        const tag = await findOrCreateTag(tagName);
        await assignProductTag(product.id, tag.id);
      }

      for (const variantSeed of item.variants) {
        const variant = await prisma.productVariant.upsert({
          where: { sku: variantSeed.sku },
          update: {
            productId: product.id,
            variantName: variantSeed.variantName,
            imageUrl: variantSeed.imageUrl,
            price: new Prisma.Decimal(variantSeed.price),
            stock: variantSeed.stock,
            weight: variantSeed.weight ?? null,
            status: ProductStatus.ACTIVE,
          },
          create: {
            productId: product.id,
            sku: variantSeed.sku,
            variantName: variantSeed.variantName,
            imageUrl: variantSeed.imageUrl,
            price: new Prisma.Decimal(variantSeed.price),
            stock: variantSeed.stock,
            weight: variantSeed.weight ?? null,
            status: ProductStatus.ACTIVE,
          },
        });

        for (const attr of variantSeed.attributes) {
          const attribute = await prisma.attribute.findUnique({
            where: { code: attr.code },
          });
          if (!attribute) {
            throw new Error(`Attribute not found for code: ${attr.code}`);
          }

          const attributeValue =
            (await prisma.attributeValue.findFirst({
              where: {
                attributeId: attribute.id,
                value: attr.value,
              },
            })) ??
            (await prisma.attributeValue.create({
              data: {
                attributeId: attribute.id,
                value: attr.value,
              },
            }));

          await upsertProductAttribute(
            variant.id,
            attribute.id,
            attributeValue.id,
          );
        }
      }

      console.log(`✅ Seeded product: ${item.code} - ${item.name}`);
    }

    const totalProducts = await prisma.product.count({
      where: { shopId: shop.id, deletedAt: null },
    });
    await prisma.shop.update({
      where: { id: shop.id },
      data: { totalProducts },
    });

    console.log("✅ Products seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  }
}

seedProducts()
  .then(() => {
    console.log("✅ Product seed completed");
  })
  .catch((error) => {
    console.error("❌ Product seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default seedProducts;
