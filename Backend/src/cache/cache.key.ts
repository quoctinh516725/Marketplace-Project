import { InputAll } from "../types";

export const KEY_PREFIX = "mplace";
const listCache = (input: InputAll, name: string) => {
  const normalize = (v: any) => {
    return v === undefined || v === null || v === ""
      ? "all"
      : String(v).trim().toLowerCase();
  };

  return (
    `${KEY_PREFIX}:${name}:list:` +
    `p=${normalize(input.page)}:` +
    `l=${normalize(input.limit)}:` +
    `s=${normalize(input.status)}:` +
    `q=${normalize(input.search)}`
  );
};

const shopProductCache = (input: InputAll, shopId: string) => {
  const normalize = (v: any) => {
    return v === undefined || v === null || v === ""
      ? "all"
      : String(v).trim().toLowerCase();
  };

  return (
    `${KEY_PREFIX}:shop:${shopId}:` +
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
    shopProduct: (input: InputAll, shopId: string) =>
      shopProductCache(input, shopId),
  },

  product: {
    detail: (productId: string) => `${KEY_PREFIX}:product:detail:${productId}`,
    list: (input: InputAll) => listCache(input, "product"),
  },
};
