import { InputAll } from "../types";

export const KEY_PREFIX = "mplace";
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
    list: (input: InputAll) => {
      const { status, page, limit, search } = input;

      const normalize = (v: any) => {
        return v === undefined || v === null || v === ""
          ? "all"
          : String(v).trim().toLowerCase();
      };

      return (
        `${KEY_PREFIX}:user:list:` +
        `p=${normalize(input.page)}:` +
        `l=${normalize(input.limit)}:` +
        `s=${normalize(input.status)}:` +
        `q=${normalize(input.search)}`
      );
    },
  },
};
