export const Provider = {
  GOOGLE: "GOOGLE",
  FACEBOOK: "FACEBOOK",
};

export type ProviderType = (typeof Provider)[keyof typeof Provider];
