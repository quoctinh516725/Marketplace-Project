import { Prisma, User, UserAddress } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { UserStatus } from "../constants";
import { InputAll, PrismaType } from "../types";
import {
  UserListResult,
  UserDetailResult,
  UserBasicResult,
  UserProfileResult,
  selectUserBasic,
  selectUserProfile,
  selectUserDetail,
} from "../types/user.type";

export interface CreateUserData {
  username: string;
  email: string;
  password: string | null; // Có thể null nếu đăng nhập bằng Oauth
  fullName?: string;
  avatarUrl?: string;
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

export type CreateUserAddressData = Prisma.UserAddressUncheckedCreateInput;
export type UpdateUserAddressData = Prisma.UserAddressUncheckedUpdateInput;

class UserRepository {
  existEmail = async (email: string): Promise<UserBasicResult | null> => {
    return await prisma.user.findUnique({
      where: { email },
      select: selectUserBasic,
    });
  };

  existUsername = async (username: string): Promise<boolean> => {
    const exist = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return exist !== null;
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

  createUserAddress = async (
    client: PrismaType,
    data: CreateUserAddressData,
  ) => {
    return await client.userAddress.create({ data });
  };

  updateUserAddress = async (
    client: PrismaType,
    addressId: string,
    data: UpdateUserAddressData,
  ) => {
    return await client.userAddress.update({
      where: { id: addressId },
      data,
    });
  };

  deleteUserAddress = async (client: PrismaType, addressId: string) => {
    return await client.userAddress.delete({ where: { id: addressId } });
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

  findUserAddressByAddressId = async (
    client: PrismaType,
    addressId: string,
  ): Promise<UserAddress | null> => {
    return await client.userAddress.findUnique({
      where: { id: addressId },
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
