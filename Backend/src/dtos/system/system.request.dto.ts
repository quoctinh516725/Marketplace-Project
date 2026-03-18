import { ValidationError } from "../../error/AppError";

export type CreateSystemSettingRequestDto = {
  key: string;
  value: string;
  description?: string;
};

export type UpdateSystemSettingRequestDto = {
  value: string;
  description?: string | null;
};

export const createSystemSettingRequestDto = (
  data: any,
): CreateSystemSettingRequestDto => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Du lieu tao cau hinh he thong khong hop le!");
  }

  const key = typeof data.key === "string" ? data.key.trim() : "";
  const value = typeof data.value === "string" ? data.value.trim() : "";

  if (!key) {
    throw new ValidationError("Key cau hinh khong duoc de trong!");
  }

  if (!value) {
    throw new ValidationError("Value cau hinh khong duoc de trong!");
  }

  let description: string | undefined;
  if (data.description !== undefined) {
    if (typeof data.description !== "string") {
      throw new ValidationError("Description khong hop le!");
    }
    description = data.description.trim() || undefined;
  }

  return {
    key,
    value,
    description,
  };
};

export const updateSystemSettingRequestDto = (
  data: any,
): UpdateSystemSettingRequestDto => {
  if (!data || typeof data !== "object") {
    throw new ValidationError(
      "Du lieu cap nhat cau hinh he thong khong hop le!",
    );
  }

  if (data.value === undefined) {
    throw new ValidationError("Vui long cung cap value!");
  }

  const value = typeof data.value === "string" ? data.value.trim() : "";
  if (!value) {
    throw new ValidationError("Value cau hinh khong duoc de trong!");
  }

  let description: string | null | undefined = undefined;
  if (data.description !== undefined) {
    if (data.description === null) {
      description = null;
    } else if (typeof data.description === "string") {
      description = data.description.trim() || null;
    } else {
      throw new ValidationError("Description khong hop le!");
    }
  }

  return {
    value,
    description,
  };
};
