import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import productService from "../../services/public/product.service";
import { ProductStatus } from "../../constants/productStatus";

class ProductController {
  getAllProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const data = await productService.getAllProducts({
        page,
        limit,
        status: ProductStatus.ACTIVE,
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

  getShopProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const shopId = req.params.shopId as string;

      const data = await productService.getShopProducts(shopId, {
        page,
        limit,
        search: req.query.search as string,
        status: ProductStatus.ACTIVE,
      });

      sendSuccess(res, data, "Lấy sản phẩm của cửa hàng thành công!");
    },
  );

  getCategoryProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const categoryId = req.params.categoryId as string;
      const data = await productService.getCategoryProducts(categoryId, {
        page,
        limit,
        search: req.query.search as string,
        status: ProductStatus.ACTIVE,
      });
      sendSuccess(res, data, "Lấy tất cả sản phẩm thành công!");
    },
  );

  // getProductBySlug = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     sendSuccess(res, data, "Lấy tất cả sản phẩm thành công!");
  //   },
  // );

  // searchProducts = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     sendSuccess(res, data, "Lấy tất cả sản phẩm thành công!");
  //   },
  // );
}

export default new ProductController();
