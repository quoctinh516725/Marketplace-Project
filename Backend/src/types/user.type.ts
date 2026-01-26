import { UserRole, UserStatus } from "../constants";
import { PaginatedResponse } from "./pagination.type";

export type UserResponse = {
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

export type UserInforResponse = UserResponse & { roles: string[] };
export type UserUpdateResponse = UserResponse;

export type UserAllResponse = PaginatedResponse<UserResponse>;
export type UserProfileResponse = {
  id: string;
  username: string;
  avatarUrl?: string;
  fullName?: string;
};
