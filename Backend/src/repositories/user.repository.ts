import { Prisma, User } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { UserStatus } from "../constants";
import { InputAll, PrismaType } from "../types";
import {
  UserListResult,
  UserDetailResult,
  UserBasicResult,
  UserProfileResult,
} from "../types/user.type";

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  status?: UserStatus;
  lastLoginAt?: Date;
  deletedAt?: Date;
}

const selectUserDetail = {
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
};

const selectUserBasic = {
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
};

const selectUserProfile = {
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
};

class UserRepository {
  existEmail = async (email: string): Promise<boolean> => {
    const exist = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return exist !== null;
  };

  existUsername = async (username: string): Promise<boolean> => {
    const exist = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return exist !== null;
  };

  create = async (
    client: PrismaType,
    data: CreateUserData,
  ): Promise<UserBasicResult> => {
    return await client.user.create({
      data,
      select: selectUserBasic,
    });
  };

  update = async (
    client: PrismaType,
    id: string,
    data: UpdateUserData,
  ): Promise<UserBasicResult> => {
    return await client.user.update({
      where: { id },
      select: selectUserBasic,
      data,
    });
  };

  getUsers = async (input: InputAll): Promise<UserListResult> => {
    const { status, page, limit, search } = input;

    const skip = (page - 1) * limit;
    const take = limit;

    let where: Prisma.UserWhereInput = {};
    if (status !== undefined) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { username: { contains: search } },
        { fullName: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: selectUserBasic,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);
    return { data: users, total };
  };

  getProfile = async (id: string): Promise<UserProfileResult | null> => {
    return await prisma.user.findUnique({
      where: { id },
      select: selectUserProfile,
    });
  };

  getUserByPermissionId = async (permissionId: string): Promise<string[]> => {
    const users = await prisma.userPermission.findMany({
      where: { permissionId },
      select: { user: { select: { id: true } } },
    });

    return users.map((u) => u.user.id);
  };

  findBasicById = async (
    client: PrismaType,
    id: string,
  ): Promise<UserBasicResult | null> => {
    return await client.user.findUnique({
      where: { id },
      select: selectUserBasic,
    });
  };

  findUserDetailById = async (
    client: PrismaType,
    id: string,
  ): Promise<UserDetailResult | null> => {
    return await client.user.findUnique({
      where: { id },
      select: selectUserDetail,
    });
  };

  existEmailOrUsername = async (
    emailOrUsername: string,
  ): Promise<User | null> => {
    return await prisma.user.findFirst({
      where: {
        OR: [{ username: emailOrUsername }, { email: emailOrUsername }],
      },
    });
  };

  updateAvatar = async (
    id: string,
    avatarUrl: string,
  ): Promise<UserBasicResult> => {
    return await prisma.user.update({
      where: {
        id,
      },
      select: selectUserBasic,
      data: { avatarUrl },
    });
  };
}

export default new UserRepository();
