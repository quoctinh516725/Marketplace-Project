import { Prisma, User } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { UserStatus } from "../constants";
import { PermissionStatus } from "../constants/permissionStatus";
import { RoleStatus } from "../constants/roleStatus";
import { InputAll, PrismaType } from "../types";
import {
  UserAllResponse,
  UserProfileWithRoles,
  UserResponse,
  UserUpdateResponse,
} from "../types/user.type";

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  phone?: string;
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

export type UserCache = Omit<
  Prisma.UserGetPayload<{
    include: {
      userRoles: {
        include: { role: true };
      };
      userPermissions: {
        include: { permission: true };
      };
    };
  }>,
  "password"
>;

class UserRepository {
  create = async (client: PrismaType, data: CreateUserData): Promise<User> => {
    return await client.user.create({
      data,
    });
  };
  update = async (
    client: PrismaType,
    id: string,
    data: UpdateUserData,
  ): Promise<UserUpdateResponse> => {
    return await client.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  };
  getUsers = async (input: InputAll): Promise<UserAllResponse> => {
    const { status, page, limit, search } = input;

    const skip = (page - 1) * limit;
    const take = limit;

    let where: any = {};
    if (status !== undefined) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        omit: { password: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { data: users, pagination: { limit, page, total } };
  };
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
  getProfile = async (id: string): Promise<UserProfileWithRoles | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        fullName: true,
        userRoles: {
          select: {
            role: {
              select: { code: true },
            },
          },
        },
      },
    });
    if (!user) return null;

    return {
      profile: {
        id: user.id,
        username: user.username,
        fullName: user.fullName ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
      },
      roleCodes: user.userRoles.map((ur) => ur.role.code),
    };
  };

  findById = async (
    client: PrismaType,
    id: string,
  ): Promise<UserCache | null> => {
    return await client.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
          where: { role: { status: RoleStatus.ACTIVE } },
        },
        userPermissions: {
          include: { permission: true },
          where: { permission: { status: PermissionStatus.ACTIVE } },
        },
      },
      omit: { password: true },
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
  ): Promise<UserResponse> => {
    return await prisma.user.update({
      where: {
        id,
      },
      data: { avatarUrl },
      omit: { password: true },
    });
  };
}

export default new UserRepository();
