import { InputAll } from "../types";

export const KEY_PREFIX = "mplace";
const listCache = (
  input: InputAll,
  name: string,
  scope?: { type: string; id: string },
) => {
  const normalize = (v: unknown) => {
    if (v === undefined || v === null || v === "") return "all";
    return encodeURIComponent(String(v).trim().toLowerCase());
  };

  const baseKey = scope
    ? `${KEY_PREFIX}:${name}:${scope.type}:${scope.id}:list:`
    : `${KEY_PREFIX}:${name}:list:`;

  return (
    baseKey +
    `p=${normalize(input.page)}:` +
    `l=${normalize(input.limit)}:` +
    `s=${normalize(input.status)}:` +
    `q=${normalize(input.search)}`
  );
};

export const CacheKey = {
  auth: {
    user: (id: string) => `${KEY_PREFIX}:user:auth:${id}`,

    token: {
      blacklist: (jti: string) => `${KEY_PREFIX}:auth:token:blacklist:${jti}`,
    },
  },
  user: {
    me: (id: string) => `${KEY_PREFIX}:user:detail:${id}`,
    profile: (id: string) => `${KEY_PREFIX}:user:profile:${id}`,
    list: (input: InputAll) => listCache(input, "user"),
  },

  shop: {
    me: (sellerId: string) => `${KEY_PREFIX}:shop:me:${sellerId}`,
    detail: (shopId: string) => `${KEY_PREFIX}:shop:detail:${shopId}`,
    list: (input: InputAll) => listCache(input, "shop"),
  },

  product: {
    public: {
      detail: (productId: string) =>
        `${KEY_PREFIX}:product:detail:public:${productId}`,
      list: (input: InputAll) => listCache(input, "product:public"),
      shopProducts: (input: InputAll, shopId: string) =>
        listCache(input, "product:public", { type: "shop", id: shopId }),
      categoryProducts: (input: InputAll, categoryId: string) =>
        listCache(input, "product:public", {
          type: "category",
          id: categoryId,
        }),
    },

    seller: {
      shopProducts: (input: InputAll, shopId: string) =>
        listCache(input, `product:seller`, { type: "shop", id: shopId }),
    },

    staff: {
      detail: (productId: string) =>
        `${KEY_PREFIX}:product:detail:staff:${productId}`,
      list: (input: InputAll) => listCache(input, "product:staff"),
    },
  },

  system: (key: string) => `${KEY_PREFIX}:system:${key}`,

  idempotency: {
    key: (key: string, userId: string) =>
      `${KEY_PREFIX}:idempotency:${key}:${userId}`,
  },
};
