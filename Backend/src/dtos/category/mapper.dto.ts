import { CategoryStatus } from "../../constants/categoryStatus";
import { NotFoundError } from "../../error/AppError";
import {
  CategoryAttributeResult,
  CategoryBasicResult,
  CategoryTreeResult,
  CategoryWithAttributesResult,
} from "../../types";
import {
  CategoryAttributeResponseDto,
  CategoryBasicResponseDto,
  CategoryDetailResponseDto,
  CategoryTreeResponseDto,
} from "./category.response.dto";

const toCategoryStatus = (isActive: boolean): CategoryStatus => {
  return isActive ? CategoryStatus.ACTIVE : CategoryStatus.INACTIVE;
};

export const toCategoryBasicResponse = (
  category: CategoryBasicResult,
): CategoryBasicResponseDto => {
  return {
    id: category.id,
    parentId: category.parentId,
    name: category.name,
    slug: category.slug,
    description: category.description,
    level: category.level,
    sortOrder: category.sortOrder,
    status: toCategoryStatus(category.isActive),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

export const toCategoryAttributeResponse = (
  categoryAttribute: CategoryAttributeResult,
): CategoryAttributeResponseDto => {
  return {
    id: categoryAttribute.attribute.id,
    code: categoryAttribute.attribute.code,
    name: categoryAttribute.attribute.name,
    description: categoryAttribute.attribute.description,
  };
};

export const toCategoryDetailResponse = (
  category: CategoryWithAttributesResult,
): CategoryDetailResponseDto => {
  return {
    ...toCategoryBasicResponse(category),
    attributes: category.categoryAttributes.map(toCategoryAttributeResponse),
  };
};

const mapNodeToDto = (node: CategoryTreeResult): CategoryTreeResponseDto => {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    parentId: node.parentId,
    level: node.level,
    sortOrder: node.sortOrder,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    status: node.isActive ? CategoryStatus.ACTIVE : CategoryStatus.INACTIVE,
    children: node.children.map(mapNodeToDto),
  };
};
export const toCategoryTreeResponse = (
  categories: CategoryBasicResult[],
  isStaff: boolean,
): CategoryTreeResponseDto[] => {
  const mapCategories = new Map<string, CategoryTreeResult>();
  const roots: CategoryTreeResult[] = [];

  categories.forEach((c) => {
    mapCategories.set(c.id, { ...c, children: [] });
  });

  categories.forEach((c) => {
    const node = mapCategories.get(c.id);
    if (!node) throw new NotFoundError("Category khong ton tai!");

    if (node.parentId) {
      const parent = mapCategories.get(node.parentId);
      if (isStaff) {
        if (parent) {
          parent.children.push(node);
        }
      } else {
        if (parent?.isActive === true) {
          parent.children.push(node);
        }
      }
    } else {
      roots.push(node);
    }
  });

  return roots.map(mapNodeToDto);
};
