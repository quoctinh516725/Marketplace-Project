import { UserRole } from "../../constants";
import { RoleStatus } from "../../constants/roleStatus";
import { ValidationError } from "../../error/AppError";

export type CreateRoleRequestDto = {
  code: string;
  name: string;
  description?: string;
};

export type UpdateRoleRequestDto = {
  name?: string;
  description?: string;
  status?: RoleStatus;
};

export const createRoleRequestDto = (data: any): CreateRoleRequestDto => {
  if (!data || typeof data !== "object")
    throw new ValidationError("Dữ liệu tạo chức năng không hợp lệ!");
  const { code, name, description } = data;
  const errors: string[] = [];
  if (!code || typeof code !== "string") {
    errors.push("Mã chức năng không hợp lệ!");
  }
  if (!name || typeof name !== "string") {
    errors.push("Tên chức năng không hợp lệ!");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }
  return {
    code,
    name,
    description,
  };
};

export const updateRoleRequestDto = (data: any): UpdateRoleRequestDto => {
  if (!data || typeof data !== "object")
    throw new ValidationError("Dữ liệu chỉnh sửa chức năng không hợp lệ!");
  const { name, description, status } = data;

  if (!name && !description && !status) {
    throw new ValidationError("Không có dữ liệu nào được gửi lên!");
  }
  const errors: string[] = [];

  if (name && typeof name !== "string") {
    errors.push("Tên chức năng không hợp lệ!");
  }

  if (status && !Object.values(RoleStatus).includes(status)) {
    errors.push("Trạng thái chức năng không hợp lệ!");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }
  return {
    name,
    description,
    status,
  };
};

export const validateRoleToUserRequestDto = (
  roleCodes: unknown,
): UserRole[] => {
  if (!Array.isArray(roleCodes)) {
    throw new ValidationError("Mã chức năng phải là một mảng.");
  }

  if (roleCodes.length === 0) {
    throw new ValidationError("Mã chức năng không được rỗng.");
  }

  if (roleCodes.some((r) => !Object.values(UserRole).includes(r))) {
    throw new ValidationError("Mã chức năng không hợp lệ!");
  }

  return roleCodes;
};
