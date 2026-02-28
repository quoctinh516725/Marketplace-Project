import { esClient } from "./config/elasticsearch";
import { prisma } from "./config/prisma";

const INDEX_NAME = "products";
const BATCH_SIZE = 200;

async function ensureProductIndex() {
  const exists = await esClient.indices.exists({ index: INDEX_NAME });
  if (exists) return;

  await esClient.indices.create({
    index: INDEX_NAME,
    mappings: {
      properties: {
        name: { type: "text" },
        description: { type: "text" },
        code: { type: "keyword" },
        slug: { type: "keyword" },
        thumbnailUrl: { type: "keyword" },
        price: { type: "float" },
        soldCount: { type: "integer" },
        rating: { type: "float" },
        shopId: { type: "keyword" },
        categoryIds: { type: "keyword" },
        createdAt: { type: "date" },
        status: { type: "keyword" },
      },
    },
  });
}

async function syncBatch(skip: number, take: number) {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    skip,
    take,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      code: true,
      slug: true,
      thumbnailUrl: true,
      originalPrice: true,
      soldCount: true,
      rating: true,
      shopId: true,
      createdAt: true,
      status: true,
      productCategories: {
        select: { categoryId: true },
      },
    },
  });

  if (products.length === 0) return 0;

  const operations = products.flatMap((product) => [
    { index: { _index: INDEX_NAME, _id: product.id } },
    {
      name: product.name,
      description: product.description ?? "",
      code: product.code,
      slug: product.slug,
      thumbnailUrl: product.thumbnailUrl,
      price: product.originalPrice ? Number(product.originalPrice) : 0,
      soldCount: product.soldCount,
      rating: product.rating ?? 0,
      shopId: product.shopId,
      categoryIds: product.productCategories.map((pc) => pc.categoryId),
      createdAt: product.createdAt,
      status: product.status,
    },
  ]);

  const result = await esClient.bulk({
    refresh: true,
    operations,
  });

  if (result.errors) {
    const failed = result.items.filter((item) => item.index?.error);
    throw new Error(
      `Bulk index failed: ${failed.length}/${products.length} documents`,
    );
  }

  return products.length;
}

async function removeSoftDeletedFromIndex() {
  const deletedProducts = await prisma.product.findMany({
    where: {
      deletedAt: { not: null },
    },
    select: { id: true },
  });

  if (deletedProducts.length === 0) return 0;

  const operations = deletedProducts.flatMap((product) => [
    { delete: { _index: INDEX_NAME, _id: product.id } },
  ]);

  const result = await esClient.bulk({
    refresh: true,
    operations,
  });

  const deleted = result.items.filter(
    (item) =>
      item.delete?.status === 200 ||
      item.delete?.status === 202 ||
      item.delete?.status === 404,
  ).length;

  return deleted;
}

async function syncProductsToElasticsearch() {
  console.log("Start syncing products to Elasticsearch...");

  await ensureProductIndex();

  const total = await prisma.product.count({
    where: { deletedAt: null },
  });

  let synced = 0;
  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const count = await syncBatch(skip, BATCH_SIZE);
    synced += count;
    console.log(`Indexed ${synced}/${total} products`);
  }

  const removed = await removeSoftDeletedFromIndex();
  console.log(`Removed ${removed} soft-deleted docs from index`);
  console.log("Sync completed");
}

syncProductsToElasticsearch()
  .catch((error) => {
    console.error("Sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

