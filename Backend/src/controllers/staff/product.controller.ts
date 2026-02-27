import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import productService from "../../services/staff/product.service";
import { reviewProductApprovalRequestDto } from "../../dtos/product";
import { ProductStatus } from "../../constants/productStatus";
import { ValidationError } from "../../error/AppError";

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

  reviewProductApproval = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const body = reviewProductApprovalRequestDto(req.body);

      const result = await productService.reviewProductApproval(
        id,
        body.status,
      );

      if (body.status !== ProductStatus.ACTIVE) {
        sendSuccess(
          res,
          { ...result, reason: body.reason },
          "Lấy sản phẩm thành công!",
        );
      } else {
        sendSuccess(res, result, "Lấy sản phẩm thành công!");
      }
    },
  );

  updateProductStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { status } = req.body;
      if (!status) throw new ValidationError("Vui long cung cap trang thai!");

      if (
        ![
          ProductStatus.ACTIVE,
          ProductStatus.INACTIVE,
          ProductStatus.BANNED,
        ].includes(status)
      ) {
        throw new ValidationError("Trang thai khong hop le!");
      }

      const productId = req.params.id as string;
      const result = await productService.updateProductStatus(
        productId,
        status,
      );

      sendSuccess(res, result, "Cap nhat trang thai san pham thanh cong!");
    },
  );
}
export default new ProductController();
