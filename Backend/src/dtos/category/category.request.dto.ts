import { CategoryStatus } from "../../constants/categoryStatus";
import { ValidationError } from "../../error/AppError";
import { generateSlug } from "../../utils/generate";

export type CreateCategoryRequestDto = {
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
};

export type UpdateCategoryRequestDto = {
  parentId?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
};

export type CreateCategoryAttributeRequestDto = {
  attributeId: string;
};

const parseNonNegativeInt = (value: unknown, field: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ValidationError(`${field} khong hop le!`);
  }
  return parsed;
};

export const createCategoryRequestDto = (data: any): CreateCategoryRequestDto => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Du lieu khong hop le!");
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) {
    throw new ValidationError("Ten danh muc khong duoc de trong!");
  }

  let slug: string | null = null;
  if (data.slug !== undefined && data.slug !== null) {
    if (typeof data.slug !== "string" || !data.slug.trim()) {
      throw new ValidationError("Slug khong hop le!");
    }
    slug = data.slug.trim();
  }

  let parentId: string | null = null;
  if (data.parentId !== undefined) {
    if (data.parentId === null || data.parentId === "") {
      parentId = null;
    } else if (typeof data.parentId === "string" && data.parentId.trim()) {
      parentId = data.parentId.trim();
    } else {
      throw new ValidationError("parentId khong hop le!");
    }
  }

  let description: string | null = null;
  if (data.description !== undefined) {
    if (data.description === null || data.description === "") {
      description = null;
    } else if (typeof data.description === "string") {
      description = data.description.trim() || null;
    } else {
      throw new ValidationError("Mo ta khong hop le!");
    }
  }

  const sortOrder =
    data.sortOrder === undefined ? 0 : parseNonNegativeInt(data.sortOrder, "sortOrder");

  return {
    parentId,
    name,
    slug: slug || generateSlug(name),
    description,
    sortOrder,
  };
};

export const updateCategoryRequestDto = (data: any): UpdateCategoryRequestDto => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Du lieu khong hop le!");
  }

  const dto: UpdateCategoryRequestDto = {};

  const allowedFields = ["parentId", "name", "slug", "description", "sortOrder"];
  const invalidFields = Object.keys(data).filter((k) => !allowedFields.includes(k));
  if (invalidFields.length > 0) {
    throw new ValidationError(`Khong duoc phep cap nhat: ${invalidFields.join(", ")}`);
  }

  if (data.parentId !== undefined) {
    if (data.parentId === null || data.parentId === "") {
      dto.parentId = null;
    } else if (typeof data.parentId === "string" && data.parentId.trim()) {
      dto.parentId = data.parentId.trim();
    } else {
      throw new ValidationError("parentId khong hop le!");
    }
  }

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new ValidationError("Ten danh muc khong hop le!");
    }
    const name = data.name.trim();
    dto.name = name;

    if (data.slug === undefined) {
      dto.slug = generateSlug(name);
    }
  }

  if (data.slug !== undefined) {
    if (typeof data.slug !== "string" || !data.slug.trim()) {
      throw new ValidationError("Slug khong hop le!");
    }
    dto.slug = data.slug.trim();
  }

  if (data.description !== undefined) {
    if (data.description === null || data.description === "") {
      dto.description = null;
    } else if (typeof data.description === "string") {
      dto.description = data.description.trim() || null;
    } else {
      throw new ValidationError("Mo ta khong hop le!");
    }
  }

  if (data.sortOrder !== undefined) {
    dto.sortOrder = parseNonNegativeInt(data.sortOrder, "sortOrder");
  }

  if (Object.keys(dto).length === 0) {
    throw new ValidationError("Khong co truong hop le de cap nhat!");
  }

  return dto;
};

export const updateCategoryStatusRequestDto = (data: any): CategoryStatus => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Du lieu khong hop le!");
  }

  const status = typeof data.status === "string" ? data.status.trim() : "";
  if (!status) {
    throw new ValidationError("Vui long cung cap status!");
  }

  if (!Object.values(CategoryStatus).includes(status as CategoryStatus)) {
    throw new ValidationError("Status khong hop le trong he thong!");
  }

  return status as CategoryStatus;
};

export const createCategoryAttributeRequestDto = (
  data: any,
): CreateCategoryAttributeRequestDto => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Du lieu khong hop le!");
  }

  const attributeId =
    typeof data.attributeId === "string" ? data.attributeId.trim() : "";

  if (!attributeId) {
    throw new ValidationError("attributeId khong hop le!");
  }

  return { attributeId };
};

