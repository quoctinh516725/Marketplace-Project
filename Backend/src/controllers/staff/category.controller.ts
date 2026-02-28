import { Request, Response } from "express";
import {
  createCategoryAttributeRequestDto,
  createCategoryRequestDto,
  updateCategoryRequestDto,
  updateCategoryStatusRequestDto,
} from "../../dtos/category";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import categoryService from "../../services/staff/category.service";


class CategoryController {
  getAllCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const data = await categoryService.getAllCategory({
        page,
        limit,
        status: req.query.status as string,
        search: req.query.search as string,
      });

      sendSuccess(res, data, "Lay danh sach danh muc thanh cong!");
    },
  );

  getCategoryTree = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const data = await categoryService.getCategoryTree();
      sendSuccess(res, data, "Lay cay danh muc thanh cong!");
    },
  );

  getCategoryById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const data = await categoryService.getCategoryById(id);
      sendSuccess(res, data, "Lay thong tin danh muc thanh cong!");
    },
  );

  createCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const payload = createCategoryRequestDto(req.body);
      const data = await categoryService.createCategory(payload);
      sendSuccess(res, data, "Tao danh muc thanh cong!");
    },
  );

  updateCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const payload = updateCategoryRequestDto(req.body);
      const data = await categoryService.updateCategory(id, payload);
      sendSuccess(res, data, "Cap nhat danh muc thanh cong!");
    },
  );

  updateCategoryStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const status = updateCategoryStatusRequestDto(req.body);
      const data = await categoryService.updateCategoryStatus(id, status);
      sendSuccess(res, data, "Cap nhat trang thai danh muc thanh cong!");
    },
  );

  deleteCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const data = await categoryService.deleteCategory(id);
      sendSuccess(res, data, "Xoa danh muc thanh cong!");
    },
  );

  createCategoryAttribute = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const categoryId = req.params.id as string;
      const payload = createCategoryAttributeRequestDto(req.body);
      const data = await categoryService.createCategoryAttribute(
        categoryId,
        payload,
      );
      sendSuccess(res, data, "Them thuoc tinh cho danh muc thanh cong!");
    },
  );

  deleteCategoryAttribute = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const categoryId = req.params.id as string;
      const attributeId = req.params.attributeId as string;
      const data = await categoryService.deleteCategoryAttribute(
        categoryId,
        attributeId,
      );
      sendSuccess(res, data, "Xoa thuoc tinh khoi danh muc thanh cong!");
    },
  );
}

export default new CategoryController();
