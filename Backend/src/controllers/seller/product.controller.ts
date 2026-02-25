import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import productService from "../../services/seller/product.service";
import { NotFoundError, ValidationError } from "../../error/AppError";
import { createProductRequestDto } from "../../dtos/product";
import { uploadStream } from "../../utils/uploadStream";

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

  createProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Người dùng không có cửa hàng!");

      const payload = createProductRequestDto(req.body);
      const data = await productService.create(shopId, payload);

      sendSuccess(res, data, "Tạo sản phẩm thành công!");
    },
  );

  uploadThumbnail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Người dùng không có cửa hàng!");

      const file = req.file;
      if (!file) throw new ValidationError("Không có ảnh được chọn!");

      const result: any = await uploadStream(file, {
        folder: `marketplace/shop/${shopId}/products/thumbnail`,
      });

      sendSuccess(
        res,
        { url: result.secure_url, public_id: result.public_id },
        "Upload ảnh thumbnail thành công!",
      );
    },
  );

  uploadImages = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Người dùng không có cửa hàng!");

      const files = (req.files as Express.Multer.File[]) ?? [];
      if (files.length === 0) {
        throw new ValidationError("Không có ảnh nào được chọn!");
      }

      const uploads = await Promise.all(
        files.map(async (file, index) => {
          const result: any = await uploadStream(file, {
            folder: `marketplace/shop/${shopId}/products/images`,
          });
          return {
            url: result.secure_url,
            public_id: result.public_id,
            sortOrder: index,
          };
        }),
      );

      sendSuccess(res, uploads, "Upload danh sách ảnh sản phẩm thành công!");
    },
  );

  // updateProduct;
  // deleteProduct;
  // updateProductStatus;
}

export default new ProductController();
