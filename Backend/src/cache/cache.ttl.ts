export const cacheTTL = {
  auth: {
    me: 15 * 60,
    blacklist: (tokenExp: number) =>
      Math.max(tokenExp - Math.floor(Date.now() / 1000), 0),
  },
};
