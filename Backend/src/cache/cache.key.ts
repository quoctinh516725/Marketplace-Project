export const KEY_PREFIX = "mplace";
export const CacheKey = {
  auth: {
    user: {
      me: (id: string) => `${KEY_PREFIX}:auth:user:${id}`,
    },
    token: {
      blacklist: (jti: string) => `${KEY_PREFIX}:auth:token:blacklist:${jti}`,
    },
  },
};
