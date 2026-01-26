export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
  DELETED: "DELETED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
