import { UserStatus } from "../../constants";
import {
  UserBasicResult,
  UserDetailResult,
  UserProfileResult,
} from "../../types";
import {
  UserBasicResponseDto,
  UserDetailResponseDto,
  UserProfileResponseDto,
} from "./user.response.dto";

export const toUserDetailResponse = (
  data: UserDetailResult,
): UserDetailResponseDto => {
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    fullName: data.fullName,
    phone: data.phone,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth
      ? data.dateOfBirth.toLocaleDateString("vi-VN")
      : null,
    avatarUrl: data.avatarUrl,
    status: data.status as UserStatus,
    lastLoginAt: data.lastLoginAt,
    createdAt: data.createdAt,
    roles: data.userRoles.map((ur) => ur.role.code),
    permissions: data.userPermissions.map((up) => up.permission.code),
  };
};
export const toUserBasicResponse = (
  data: UserBasicResult,
): UserBasicResponseDto => {
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    fullName: data.fullName,
    phone: data.phone,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth
      ? data.dateOfBirth.toLocaleDateString("vi-VN")
      : null,
    avatarUrl: data.avatarUrl,
    status: data.status as UserStatus,
    lastLoginAt: data.lastLoginAt,
    createdAt: data.createdAt,
  };
};

export const toUserProfileResponse = (
  data: UserProfileResult,
): UserProfileResponseDto => {
  return {
    id: data.id,
    username: data.username,
    fullName: data.fullName,
    avatarUrl: data.avatarUrl,
  };
};
