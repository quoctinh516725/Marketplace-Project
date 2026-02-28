import { CategoryStatus } from "../../constants/categoryStatus";
import { PaginatedResponseDto } from "../common";

export type CategoryAttributeResponseDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type CategoryBasicResponseDto = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  level: number;
  sortOrder: number;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryTreeResponseDto = CategoryBasicResponseDto & {
  children: CategoryTreeResponseDto[];
};

export type CategoryDetailResponseDto = CategoryBasicResponseDto & {
  attributes: CategoryAttributeResponseDto[];
};

export type CategoryListResponseDto =
  PaginatedResponseDto<CategoryBasicResponseDto>;
