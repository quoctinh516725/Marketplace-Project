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

export type CreateUserAddressRequest = {
  name: string;
  address: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  isDefault?: boolean;
};

export type UpdateUserAddressRequest = {
  name?: string;
  address?: string;
  phone?: string;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  isDefault?: boolean;
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

export const createUserAddressRequest = (
  data: any,
): CreateUserAddressRequest => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }

  // Validate required fields
  if (data.name === undefined || data.name === null) {
    throw new ValidationError("name là bắt buộc!");
  }
  if (data.address === undefined || data.address === null) {
    throw new ValidationError("address là bắt buộc!");
  }
  if (data.phone === undefined || data.phone === null) {
    throw new ValidationError("phone là bắt buộc!");
  }
  if (data.provinceId === undefined || data.provinceId === null) {
    throw new ValidationError("provinceId là bắt buộc!");
  }
  if (data.districtId === undefined || data.districtId === null) {
    throw new ValidationError("districtId là bắt buộc!");
  }
  if (data.wardCode === undefined || data.wardCode === null) {
    throw new ValidationError("wardCode là bắt buộc!");
  }

  // Validate name
  if (typeof data.name !== "string") {
    throw new ValidationError("name không hợp lệ!");
  }
  const name = data.name.trim();
  if (!name) {
    throw new ValidationError("name không hợp lệ!");
  }

  // Validate address
  if (typeof data.address !== "string") {
    throw new ValidationError("address không hợp lệ!");
  }
  const address = data.address.trim();
  if (!address) {
    throw new ValidationError("address không hợp lệ!");
  }

  // Validate phone
  if (typeof data.phone !== "string") {
    throw new ValidationError("phone không hợp lệ!");
  }
  const phone = data.phone.trim();
  if (!phone) {
    throw new ValidationError("phone không hợp lệ!");
  }

  // Validate provinceId
  const provinceId = Number(data.provinceId);
  if (!Number.isInteger(provinceId) || provinceId <= 0) {
    throw new ValidationError("provinceId không hợp lệ!");
  }

  // Validate districtId
  const districtId = Number(data.districtId);
  if (!Number.isInteger(districtId) || districtId <= 0) {
    throw new ValidationError("districtId không hợp lệ!");
  }

  // Validate wardCode
  if (typeof data.wardCode !== "string") {
    throw new ValidationError("wardCode không hợp lệ!");
  }
  const wardCode = data.wardCode.trim();
  if (!wardCode) {
    throw new ValidationError("wardCode không hợp lệ!");
  }

  const result: CreateUserAddressRequest = {
    name,
    address,
    phone,
    provinceId,
    districtId,
    wardCode,
  };

  // Validate optional isDefault
  if (data.isDefault !== undefined) {
    if (typeof data.isDefault !== "boolean") {
      throw new ValidationError("isDefault không hợp lệ!");
    }
    result.isDefault = data.isDefault;
  }

  return result;
};

export const updateUserAddressRequest = (
  data: any,
): UpdateUserAddressRequest => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }
  const allowedData: UpdateUserAddressRequest = {};

  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      throw new ValidationError("name không hợp lệ!");
    }
    const name = data.name.trim();
    if (!name) {
      throw new ValidationError("name không hợp lệ!");
    }
    allowedData.name = name;
  }

  if (data.address !== undefined) {
    if (typeof data.address !== "string") {
      throw new ValidationError("address không hợp lệ!");
    }
    const address = data.address.trim();
    if (!address) {
      throw new ValidationError("address không hợp lệ!");
    }
    allowedData.address = address;
  }

  if (data.phone !== undefined) {
    if (typeof data.phone !== "string") {
      throw new ValidationError("phone không hợp lệ!");
    }
    const phone = data.phone.trim();
    if (!phone) {
      throw new ValidationError("phone không hợp lệ!");
    }
    allowedData.phone = phone;
  }

  if (data.provinceId !== undefined) {
    const provinceId = Number(data.provinceId);
    if (!Number.isInteger(provinceId) || provinceId <= 0) {
      throw new ValidationError("provinceId không hợp lệ!");
    }
    allowedData.provinceId = provinceId;
  }

  if (data.districtId !== undefined) {
    const districtId = Number(data.districtId);
    if (!Number.isInteger(districtId) || districtId <= 0) {
      throw new ValidationError("districtId không hợp lệ!");
    }
    allowedData.districtId = districtId;
  }

  if (data.wardCode !== undefined) {
    if (typeof data.wardCode !== "string") {
      throw new ValidationError("wardCode không hợp lệ!");
    }
    const wardCode = data.wardCode.trim();
    if (!wardCode) {
      throw new ValidationError("wardCode không hợp lệ!");
    }
    allowedData.wardCode = wardCode;
  }

  if (data.isDefault !== undefined) {
    if (typeof data.isDefault !== "boolean") {
      throw new ValidationError("isDefault không hợp lệ!");
    }
    allowedData.isDefault = data.isDefault;
  }

  return allowedData;
};
