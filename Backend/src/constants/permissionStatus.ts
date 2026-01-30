export const PermissionStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type PermissionStatus =
  (typeof PermissionStatus)[keyof typeof PermissionStatus];
