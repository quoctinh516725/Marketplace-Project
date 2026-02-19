import { PaginatedResult } from "../dtos";

export type UserBasicResult = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  avatarUrl: string | null;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
};
export type UserDetailResult = UserBasicResult & {
  deletedAt: Date | null;
  userRoles: {
    role: {
      id: string;
      code: string;
    };
  }[];

  userPermissions: {
    permission: {
      id: string;
      code: string;
    };
  }[];
};

export type UserProfileResult = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  userRoles: {
    role: {
      id: string;
      code: string;
    };
  }[];
};

export type UserListResult = PaginatedResult<UserBasicResult>;
