import { Prisma } from "../../generated/prisma/client";
import { PaginatedResult } from "../dtos";
export const selectUserDetail = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  gender: true,
  dateOfBirth: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  deletedAt: true,

  userRoles: {
    select: {
      role: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  },

  userPermissions: {
    select: {
      permission: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  },

  addresses: {
    select: {
      address: true,
      districtId: true,
      provinceId: true,
      wardCode: true,
    },
  },
} satisfies Prisma.UserSelect;

export const selectUserBasic = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  gender: true,
  dateOfBirth: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const selectUserProfile = {
  id: true,
  username: true,
  fullName: true,
  avatarUrl: true,
  userRoles: {
    select: {
      role: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

export type UserBasicResult = Prisma.UserGetPayload<{
  select: typeof selectUserBasic;
}>;

export type UserDetailResult = Prisma.UserGetPayload<{
  select: typeof selectUserDetail;
}>;

export type UserProfileResult = Prisma.UserGetPayload<{
  select: typeof selectUserProfile;
}>;

export type UserListResult = PaginatedResult<
  Prisma.UserGetPayload<{
    select: typeof selectUserBasic;
  }>
>;
