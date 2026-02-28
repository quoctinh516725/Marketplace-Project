import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import categoryService from "../../services/public/category.service";

class CategoryController {
  getCategoryTree = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const data = await categoryService.getCategoryTree();

      sendSuccess(res, data, "Lay cay danh muc thanh cong!");
    },
  );

  getActiveCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const data = await categoryService.getActiveCategory({
        page,
        limit,
        search: req.query.search as string,
      });

      sendSuccess(res, data, "Lay danh sach danh muc thanh cong!");
    },
  );

  getCategoryById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const data = await categoryService.getCategoryById(id);
      sendSuccess(res, data, "Lay thong tin danh muc thanh cong!");
    },
  );

  getCategoryBySlug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const slug = req.params.slug as string;
      const data = await categoryService.getCategoryBySlug(slug);
      sendSuccess(res, data, "Lay thong tin danh muc thanh cong!");
    },
  );

  getAttributeByCategoryId = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const categoryId = req.params.id as string;
      const data = await categoryService.getAttributeByCategoryId(categoryId);
      sendSuccess(res, data, "Lay thuoc tinh cua danh muc thanh cong!");
    },
  );
}

export default new CategoryController();
