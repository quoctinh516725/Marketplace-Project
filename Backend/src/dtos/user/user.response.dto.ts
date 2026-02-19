import { PaginatedResponseDto } from "../common";

export type UserBasicResponseDto = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
};
export type UserDetailResponseDto = UserBasicResponseDto & {
  roles: string[];
  permissions: string[];
};

export type UserProfileResponseDto = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export type UserListResponseDto = PaginatedResponseDto<UserBasicResponseDto>;
