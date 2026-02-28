import { PermissionCode } from "../../constants/permissionCode";
import { PermissionStatus } from "../../constants/permissionStatus";
import { ValidationError } from "../../error/AppError";

export type CreatePermissionRequestDto = {
  code: string;
  description?: string;
};

export type UpdatePermissionRequestDto = {
  code?: string;
  description?: string;
  status?: PermissionStatus;
};

export const createPermissionRequestDto = (
  data: any,
): CreatePermissionRequestDto => {
  if (!data || typeof data !== "object")
    throw new ValidationError("Dữ liệu tạo quyền không hợp lệ!");
  const { code, description } = data;
  const errors: string[] = [];
  if (!code || typeof code !== "string") {
    errors.push("Mã quyền không hợp lệ!");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }
  return {
    code,
    description,
  };
};
export const updatePermissionRequestDto = (
  data: any,
): UpdatePermissionRequestDto => {
  if (!data || typeof data !== "object")
    throw new ValidationError("Dữ liệu tạo quyền không hợp lệ!");
  const { code, description, status } = data;
  if (!code && !description && !status) {
    throw new ValidationError("Không có dữ liệu nào được gửi lên!");
  }
  const errors: string[] = [];
  if (code && typeof code !== "string") {
    errors.push("Mã quyền không hợp lệ!");
  }

  if (description && typeof description !== "string") {
    errors.push("Mô tả không hợp lệ!");
  }

  if (data.status && !Object.values(PermissionStatus).includes(data.status)) {
    throw new ValidationError("Trạng thái quyền không hợp lệ!");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }

  return {
    code,
    description,
    status,
  };
};
export const validatePermissionRequestDto = (
  permissions: unknown,
): PermissionCode[] => {
  if (!Array.isArray(permissions)) {
    throw new ValidationError("Quyền không hợp lệ!");
  }
  if (permissions.length === 0)
    throw new ValidationError("Không có quyền nào được tải lên!");

  if (permissions.some((p) => !Object.values(PermissionCode).includes(p))) {
    throw new ValidationError("Quyền không hợp lệ!");
  }

  return permissions;
};
