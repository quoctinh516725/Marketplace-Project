import { InputAll } from "../types";

export const KEY_PREFIX = "mplace";
const listCache = (input: InputAll, name: string) => {
  const { status, page, limit, search } = input;

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
export const CacheKey = {
  auth: {
    user: (id: string) => `${KEY_PREFIX}:user:auth:${id}`,

    token: {
      blacklist: (jti: string) => `${KEY_PREFIX}:auth:token:blacklist:${jti}`,
    },
  },
  user: {
    detail: (id: string) => `${KEY_PREFIX}:user:detail:${id}`,
    profile: (id: string) => `${KEY_PREFIX}:user:profile:${id}`,
    list: (input: InputAll) => listCache(input, "user"),
  },

  shop: {
    list: (input: InputAll) => listCache(input, "shop"),
    me: (sellerId: string) => `${KEY_PREFIX}:shop:me:${sellerId}`,
  },
};
