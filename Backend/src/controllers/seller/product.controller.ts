import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import productService from "../../services/seller/product.service";
import { NotFoundError } from "../../error/AppError";

class ProductController {
  getMyProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Bạn chưa có cửa hàng!");

      const data = await productService.getMyProducts(shopId, {
        page,
        limit,
        status: req.query.status as string,
        search: req.query.search as string,
      });

      sendSuccess(res, data, "Lấy sản phẩm của cửa hàng thành công!");
    },
  );
  getMyProductById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Người dùng không có cửa hàng!");
      const data = await productService.getMyProductById(id, shopId);
      sendSuccess(res, data, "Lấy sản phẩm thành công!");
    },
  );
}
export default new ProductController();
