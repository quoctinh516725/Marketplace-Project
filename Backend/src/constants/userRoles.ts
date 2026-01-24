export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  SELLER: "SELLER",
  GUEST: "GUEST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
