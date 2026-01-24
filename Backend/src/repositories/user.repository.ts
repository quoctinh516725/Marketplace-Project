import { User } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { UserStatus } from "../constants";
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}
export interface UpdateUserData {
  fullname?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  status?: UserStatus;
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
  async create(data: CreateUserData): Promise<User> {
    const newUser = await prisma.user.create({
      data,
    });
    return newUser;
  }
  async update(id: string, data: UpdateUserData): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
    return updatedUser;
  }
}

export default new UserRepository();
