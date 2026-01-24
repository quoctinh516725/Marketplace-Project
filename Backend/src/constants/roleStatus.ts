export const RoleStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type RoleStatus = (typeof RoleStatus)[keyof typeof RoleStatus];
