import { ALLOWED_FIELDS, UserStatus } from "../../constants";
import { ValidationError } from "../../error/AppError";

export type UserUpdateRequest = {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
};

export const userUpdateRequest = (data: any): UserUpdateRequest => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }
  const allowedData: UserUpdateRequest = {};
  const checkData = Object.keys(data).filter(
    (key) => !ALLOWED_FIELDS.includes(key as any),
  );

  if (checkData.length > 0) {
    throw new ValidationError(
      `Không được phép chỉnh sửa ${checkData.join(", ")}`,
    );
  }

  if (data.fullName !== undefined) allowedData.fullName = data.fullName;
  if (data.phone !== undefined) allowedData.phone = data.phone;
  if (data.gender !== undefined) allowedData.gender = data.gender;
  if (data.dateOfBirth !== undefined)
    allowedData.dateOfBirth = new Date(data.dateOfBirth);

  return allowedData;
};

export const updateUserStatusRequestDto = (status: UserStatus): UserStatus => {
  if (!status) throw new ValidationError("Trạng thái không hợp lệ!");
  const allowedStatusUpdate: UserStatus[] = [
    UserStatus.ACTIVE,
    UserStatus.BANNED,
    UserStatus.INACTIVE,
  ];
  if (!allowedStatusUpdate.includes(status)) {
    throw new ValidationError("Trạng thái không hợp lệ!");
  }
  return status;
};
