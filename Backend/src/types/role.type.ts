import { Prisma } from "../../generated/prisma/client";

export const roleBasicSelect = {
  id: true,
  code: true,
  name: true,
  status: true,
} satisfies Prisma.RoleSelect;

export const roleDetailSelect = {
  id: true,
  code: true,
  name: true,
  status: true,
  description: true,
  rolePermissions: {
    select: {
      permission: { select: { code: true } },
    },
  },
};

export type RoleBasicResult = Prisma.RoleGetPayload<{
  select: typeof roleBasicSelect;
}>;

export type RoleDetailResult = Prisma.RoleGetPayload<{
  select: typeof roleDetailSelect;
}>;
