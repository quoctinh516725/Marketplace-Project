import { PaginatedResult } from "../dtos";

export type PermissionBasicResult = {
  id: string;
  code: string;
  status: string;
  description: string | null;
};

export type PermissionListResult = PaginatedResult<PermissionBasicResult>;
