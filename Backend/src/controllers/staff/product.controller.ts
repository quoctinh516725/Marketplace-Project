import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import productService from "../../services/public/product.service";
import { sendSuccess } from "../../utils/response";

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
}
export default new ProductController();
