import { PermissionStatus } from "../../constants/permissionStatus";
import { PaginatedResponseDto } from "../common";

export type PermissionResponseDto = {
  id: string;
  code: string;
  description: string | null;
  status: PermissionStatus;
};
export type PermissionListResponseDto =
  PaginatedResponseDto<PermissionResponseDto>;
