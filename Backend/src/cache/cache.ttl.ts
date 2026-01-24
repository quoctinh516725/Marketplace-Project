export const cacheTTL = {
  auth: {
    blacklist: (tokenExp: number) =>
      Math.max(tokenExp - Math.floor(Date.now() / 1000), 0),
  },
};
