import { User } from "../../generated/prisma/client";

export type UserResponse = Omit<User, "password"> & { roles: string[] };
export type UserUpdateResponse = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  avatarUrl: string | null;
  status: string;
  updatedAt: Date;
};
