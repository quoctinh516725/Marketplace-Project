import { PermissionStatus } from "../../constants/permissionStatus";
import { PermissionBasicResult } from "../../types";
import { PermissionResponseDto } from "./permission.response.dto";

export const toPermissionResponseDto = (
  permission: PermissionBasicResult,
): PermissionResponseDto => {
  return {
    id: permission.id,
    code: permission.code,
    description: permission.description,
    status: permission.status as PermissionStatus,
  };
};
