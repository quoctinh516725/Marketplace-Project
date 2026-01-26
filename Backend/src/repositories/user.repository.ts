import { Prisma, User } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { UserStatus } from "../constants";
import { getAllInput, PrismaType } from "../types";
import {
  UserAllResponse,
  UserInforResponse,
  UserProfileResponse,
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

export type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      include: { role: true };
    };
  };
}>;

class UserRepository {
  create = async (client: PrismaType, data: CreateUserData): Promise<User> => {
    const newUser = await client.user.create({
      data,
    });
    return newUser;
  };
  update = async (
    client: PrismaType,
    id: string,
    data: UpdateUserData,
  ): Promise<UserUpdateResponse> => {
    const updatedUser = await client.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
    return updatedUser;
  };
  getUsers = async (input: getAllInput): Promise<UserAllResponse> => {
    const { status, page, limit, search } = input;

    const skip = (page - 1) * limit;
    const take = limit;

    let where: any = {};
    if (status) where = status ? { status: status } : {};
    if (search) {
      where.OR = [
        { email: { contains: search }, mode: "insensitive" },
        { username: { contains: search }, mode: "insensitive" },
        { fullName: { contains: search }, mode: "insensitive" },
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
  getProfile = async (id: string): Promise<UserProfileResponse | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, avatarUrl: true, fullName: true },
    });
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
    };
  };

  findById = async (id: string): Promise<UserWithRoles | null> => {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
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
  updateAvatar = async (id: string, avatarUrl: string): Promise<void> => {
    await prisma.user.update({
      where: {
        id,
      },
      data: { avatarUrl },
    });
  };
}

export default new UserRepository();
