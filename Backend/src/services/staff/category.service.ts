import { prisma } from "../../config/prisma";
import { CategoryStatus } from "../../constants/categoryStatus";
import {
  CreateCategoryAttributeRequestDto,
  CreateCategoryRequestDto,
  CategoryAttributeResponseDto,
  CategoryDetailResponseDto,
  CategoryListResponseDto,
  UpdateCategoryRequestDto,
  toCategoryAttributeResponse,
  toCategoryBasicResponse,
  toCategoryDetailResponse,
  CategoryTreeResponseDto,
  toCategoryTreeResponse,
} from "../../dtos/category";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../error/AppError";
import attributeRepository from "../../repositories/attribute.repository";
import categoryRepository from "../../repositories/category.repository";
import { InputAll } from "../../types";

class CategoryService {
  private mapStatusToIsActive(status: CategoryStatus): boolean {
    return status === CategoryStatus.ACTIVE;
  }

  private async validateParentHierarchy(
    categoryId: string,
    parentId: string | null,
  ): Promise<void> {
    if (!parentId) return;

    if (categoryId === parentId) {
      throw new ValidationError("Danh muc khong the la cha cua chinh no!");
    }

    let currentParentId: string | null = parentId;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        throw new ValidationError("Khong the tao vong lap danh muc!");
      }

      const parent = await categoryRepository.findById(currentParentId);
      if (!parent) {
        throw new NotFoundError("Danh muc cha khong ton tai!");
      }

      currentParentId = parent.parentId;
    }
  }

  getAllCategory = async (
    input: InputAll,
  ): Promise<CategoryListResponseDto> => {
    let isActiveFilter: boolean | undefined;

    if (input.status !== undefined && input.status !== "") {
      if (
        !Object.values(CategoryStatus).includes(input.status as CategoryStatus)
      ) {
        throw new ValidationError("Status khong hop le trong he thong!");
      }
      isActiveFilter = this.mapStatusToIsActive(input.status as CategoryStatus);
    }

    const categories = await categoryRepository.getAll(input, isActiveFilter);

    return {
      data: categories.data.map(toCategoryBasicResponse),
      pagination: {
        page: input.page,
        limit: input.limit,
        total: categories.total,
      },
    };
  };

  getCategoryById = async (id: string): Promise<CategoryDetailResponseDto> => {
    const category = await categoryRepository.findByIdWithAttributes(id);
    if (!category) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    return toCategoryDetailResponse(category);
  };

  createCategory = async (
    data: CreateCategoryRequestDto,
  ): Promise<CategoryDetailResponseDto> => {
    let level = 0;

    if (data.parentId) {
      const parent = await categoryRepository.findById(data.parentId);
      if (!parent) {
        throw new NotFoundError("Danh muc cha khong ton tai!");
      }
      level = parent.level + 1;
    }

    const categoryBySlug = await categoryRepository.findBySlug(data.slug);
    if (categoryBySlug) {
      throw new ConflictError("Slug da ton tai trong he thong!");
    }

    const created = await categoryRepository.create(prisma, {
      parentId: data.parentId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      level,
      sortOrder: data.sortOrder,
      isActive: true,
    });

    const categoryDetail = await categoryRepository.findByIdWithAttributes(
      created.id,
    );
    if (!categoryDetail) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    return toCategoryDetailResponse(categoryDetail);
  };

  updateCategory = async (
    id: string,
    data: UpdateCategoryRequestDto,
  ): Promise<CategoryDetailResponseDto> => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    if (data.parentId !== undefined) {
      await this.validateParentHierarchy(id, data.parentId);
    }

    if (data.slug !== undefined) {
      const categoryBySlug = await categoryRepository.findBySlug(data.slug);
      if (categoryBySlug && categoryBySlug.id !== id) {
        throw new ConflictError("Slug da ton tai trong he thong!");
      }
    }

    let level = category.level;
    if (data.parentId !== undefined) {
      if (data.parentId === null) {
        level = 0;
      } else {
        const parent = await categoryRepository.findById(data.parentId);
        if (!parent) {
          throw new NotFoundError("Danh muc cha khong ton tai!");
        }
        level = parent.level + 1;
      }
    }

    await categoryRepository.update(prisma, id, {
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.parentId !== undefined && { level }),
    });

    const updated = await categoryRepository.findByIdWithAttributes(id);
    if (!updated) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    return toCategoryDetailResponse(updated);
  };

  updateCategoryStatus = async (
    id: string,
    status: CategoryStatus,
  ): Promise<CategoryDetailResponseDto> => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    await categoryRepository.update(prisma, id, {
      isActive: this.mapStatusToIsActive(status),
    });

    const updated = await categoryRepository.findByIdWithAttributes(id);
    if (!updated) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    return toCategoryDetailResponse(updated);
  };

  deleteCategory = async (id: string): Promise<CategoryDetailResponseDto> => {
    const category = await categoryRepository.findByIdWithAttributes(id);
    if (!category) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    const [childrenCount, productCount] = await Promise.all([
      categoryRepository.countChildren(id),
      categoryRepository.countProductCategories(id),
    ]);

    if (childrenCount > 0) {
      throw new ConflictError("Khong the xoa danh muc dang co danh muc con!");
    }

    if (productCount > 0) {
      throw new ConflictError(
        "Khong the xoa danh muc dang duoc gan cho san pham!",
      );
    }

    await categoryRepository.delete(prisma, id);

    return toCategoryDetailResponse(category);
  };

  createCategoryAttribute = async (
    categoryId: string,
    data: CreateCategoryAttributeRequestDto,
  ): Promise<CategoryAttributeResponseDto> => {
    const [category, attribute] = await Promise.all([
      categoryRepository.findById(categoryId),
      attributeRepository.findById(data.attributeId),
    ]);

    if (!category) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    if (!attribute) {
      throw new NotFoundError("Thuoc tinh khong ton tai!");
    }

    const existing = await categoryRepository.findCategoryAttribute(
      categoryId,
      data.attributeId,
    );

    if (existing) {
      throw new ConflictError("Thuoc tinh da ton tai trong danh muc!");
    }

    const created = await categoryRepository.createCategoryAttribute(
      prisma,
      categoryId,
      data.attributeId,
    );

    return toCategoryAttributeResponse(created);
  };

  deleteCategoryAttribute = async (
    categoryId: string,
    attributeId: string,
  ): Promise<CategoryAttributeResponseDto> => {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    const existing = await categoryRepository.findCategoryAttribute(
      categoryId,
      attributeId,
    );

    if (!existing) {
      throw new NotFoundError("Thuoc tinh khong ton tai trong danh muc!");
    }

    const deleted = await categoryRepository.deleteCategoryAttribute(
      prisma,
      categoryId,
      attributeId,
    );

    return toCategoryAttributeResponse(deleted);
  };
  getCategoryTree = async (): Promise<CategoryTreeResponseDto[]> => {
    const categories = await categoryRepository.findAll();

    return toCategoryTreeResponse(categories,true);
  };
}

export default new CategoryService();
