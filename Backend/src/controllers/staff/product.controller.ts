import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import productService from "../../services/staff/product.service";

class ProductController {
  getAllProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const data = await productService.getAllProducts({
        page,
        limit,
        status: req.query.status as string,
      });

      sendSuccess(res, data, "Lấy tất cả sản phẩm thành công!");
    },
  );

  getProductById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const data = await productService.getProductById(id);
      sendSuccess(res, data, "Lấy sản phẩm thành công!");
    },
  );
}
export default new ProductController();
