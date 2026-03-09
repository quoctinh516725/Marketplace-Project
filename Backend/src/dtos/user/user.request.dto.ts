import { ALLOWED_FIELDS, UserStatus } from "../../constants";
import { ValidationError } from "../../error/AppError";

export type UserUpdateRequest = {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
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

  if (data.provinceId !== undefined) {
    const provinceId = Number(data.provinceId);
    if (!Number.isInteger(provinceId) || provinceId <= 0) {
      throw new ValidationError("provinceId khong hop le!");
    }
    allowedData.provinceId = provinceId;
  }

  if (data.districtId !== undefined) {
    const districtId = Number(data.districtId);
    if (!Number.isInteger(districtId) || districtId <= 0) {
      throw new ValidationError("districtId khong hop le!");
    }
    allowedData.districtId = districtId;
  }

  if (data.wardCode !== undefined) {
    if (typeof data.wardCode !== "string") {
      throw new ValidationError("wardCode khong hop le!");
    }
    const wardCode = data.wardCode.trim();
    if (!wardCode) {
      throw new ValidationError("wardCode khong hop le!");
    }
    allowedData.wardCode = wardCode;
  }

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
