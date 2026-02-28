import { esClient } from "./config/elasticsearch";

export default async function createProductIndex() {
  await esClient.indices.create({
    index: "products",
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

  console.log("Product index created");
}
