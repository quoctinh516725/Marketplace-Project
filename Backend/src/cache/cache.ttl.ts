import { profile } from "node:console";
import { listen } from "node:quic";

export const CacheTTL = {
  auth: {
    blacklist: (tokenExp: number) =>
      Math.max(tokenExp - Math.floor(Date.now() / 1000), 0),
  },
  me: {
    detail: 15 * 60,
    profile: 15 * 60,
    list: 60,
  },
  shop: {
    me: 3 * 60,
    detail: 3 * 60,
    list: 3 * 60,
  },
  product: {
    detail: 3 * 60,
    list: 3 * 60,
  },
};
