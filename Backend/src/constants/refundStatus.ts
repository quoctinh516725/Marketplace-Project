export const RefundStatus = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
} as const;

export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];
