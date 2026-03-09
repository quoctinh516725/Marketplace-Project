export const System = {
  DEFAULT_COMMISSION_RATE: "DEFAULT_COMMISSION_RATE",
} as const;

export type System = (typeof System)[keyof typeof System];
