import { User } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { UserStatus } from "../constants";
import { PrismaType } from "../types";

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
}

class UserRepository {
  async existEmail(email: string): Promise<boolean> {
    const exist = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return exist !== null;
  }
  async existUsername(username: string): Promise<boolean> {
    const exist = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return exist !== null;
  }
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }
  async create(client: PrismaType, data: CreateUserData): Promise<User> {
    const newUser = await client.user.create({
      data,
    });
    return newUser;
  }
  async update(
    client: PrismaType,
    id: string,
    data: UpdateUserData,
  ): Promise<User> {
    const updatedUser = await client.user.update({
      where: { id },
      data,
    });
    return updatedUser;
  }
  async existEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: {
        OR: [{ username: emailOrUsername }, { email: emailOrUsername }],
      },
    });
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<void> {
    await prisma.user.update({
      where: {
        id,
      },
      data: { avatarUrl },
    });
  }
}

export default new UserRepository();
