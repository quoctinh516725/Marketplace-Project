export const PaymentMethod = {
  COD: "COD",
  VNPAY: "VNPAY",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
