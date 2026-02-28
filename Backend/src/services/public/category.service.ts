import {
  CategoryAttributeResponseDto,
  CategoryDetailResponseDto,
  CategoryListResponseDto,
  CategoryTreeResponseDto,
  toCategoryAttributeResponse,
  toCategoryBasicResponse,
  toCategoryDetailResponse,
  toCategoryTreeResponse,
} from "../../dtos/category";
import { NotFoundError } from "../../error/AppError";
import categoryRepository from "../../repositories/category.repository";
import { InputAll } from "../../types";

class CategoryService {
  // getCategoryTree

  getCategoryBySlug = async (
    slug: string,
  ): Promise<CategoryDetailResponseDto> => {
    const category = await categoryRepository.findBySlug(slug);
    if (!category || !category.isActive) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    const categoryDetail = await categoryRepository.findByIdWithAttributes(
      category.id,
    );
    if (!categoryDetail || !categoryDetail.isActive) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    return toCategoryDetailResponse(categoryDetail);
  };

  getCategoryById = async (id: string): Promise<CategoryDetailResponseDto> => {
    const category = await categoryRepository.findByIdWithAttributes(id);
    if (!category || !category.isActive) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    return toCategoryDetailResponse(category);
  };

  getActiveCategory = async (
    input: InputAll,
  ): Promise<CategoryListResponseDto> => {
    const categories = await categoryRepository.getAll(input, true);

    return {
      data: categories.data.map(toCategoryBasicResponse),
      pagination: {
        page: input.page,
        limit: input.limit,
        total: categories.total,
      },
    };
  };

  // getChildrenCategory

  getAttributeByCategoryId = async (
    categoryId: string,
  ): Promise<CategoryAttributeResponseDto[]> => {
    const category = await categoryRepository.findById(categoryId);
    if (!category || !category.isActive) {
      throw new NotFoundError("Danh muc khong ton tai!");
    }

    const attributes =
      await categoryRepository.getCategoryAttributes(categoryId);

    return attributes.map(toCategoryAttributeResponse);
  };

  getCategoryTree = async (): Promise<CategoryTreeResponseDto[]> => {
    const categories = await categoryRepository.findAll({
      isActive: true,
    });
    return toCategoryTreeResponse(categories, false);
  };
}

export default new CategoryService();
