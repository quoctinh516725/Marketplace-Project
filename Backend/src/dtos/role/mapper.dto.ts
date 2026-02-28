import { RoleStatus } from "../../constants/roleStatus";
import { RoleBasicResult, RoleDetailResult } from "../../types";
import {
  RoleBasicResponseDto,
  RoleDetailResponseDto,
} from "./role.response.dto";

export const toRoleDetailResponse = (
  role: RoleDetailResult,
): RoleDetailResponseDto => {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    status: role.status as RoleStatus,
    description: role.description,
    permissions: role.rolePermissions.map((rp) => rp.permission.code),
  };
};
export const toRoleBasicResponse = (
  role: RoleBasicResult,
): RoleBasicResponseDto => {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    status: role.status as RoleStatus,
  };
};
