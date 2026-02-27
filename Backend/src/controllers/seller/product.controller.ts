import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import productService from "../../services/seller/product.service";
import { NotFoundError, ValidationError } from "../../error/AppError";
import {
  createProductRequestDto,
  updateProductRequestDto,
  updateShopProductStatusRequestDto,
} from "../../dtos/product";

class ProductController {
  getMyProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Ban chua co cua hang!");

      const data = await productService.getMyProducts(shopId, {
        page,
        limit,
        status: req.query.status as string,
        search: req.query.search as string,
      });

      sendSuccess(res, data, "Lay san pham cua cua hang thanh cong!");
    },
  );

  getMyProductById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Nguoi dung khong co cua hang!");
      const data = await productService.getMyProductById(id, shopId);
      sendSuccess(res, data, "Lay san pham thanh cong!");
    },
  );

  createProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Nguoi dung khong co cua hang!");

      const payload = createProductRequestDto(req.body);
      const data = await productService.create(shopId, payload);

      sendSuccess(res, data, "Tao san pham thanh cong!");
    },
  );

  uploadThumbnail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Nguoi dung khong co cua hang!");

      const file = req.file;
      if (!file) throw new ValidationError("Khong co anh duoc chon!");

      const productId = req.params.id as string;
      if (!productId)
        throw new ValidationError("Vui lòng chọn sản phẩm cần upload!");

      const result = await productService.uploadThumbnail(
        shopId,
        file,
        productId,
      );

      sendSuccess(res, result, "Upload anh thumbnail thanh cong!");
    },
  );

  uploadImages = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Nguoi dung khong co cua hang!");

      const files = (req.files as Express.Multer.File[]) ?? [];
      if (files.length === 0) {
        throw new ValidationError("Khong co anh nao duoc chon!");
      }

      const productId = req.params.id as string;
      if (!productId)
        throw new ValidationError("Vui lòng chọn sản phẩm cần upload!");

      const uploads = await productService.uploadImages(
        shopId,
        files,
        productId,
      );

      sendSuccess(res, uploads, "Upload danh sach anh san pham thanh cong!");
    },
  );

  updateProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Nguoi dung khong co cua hang!");

      const productId = req.params.id as string;
      const data = updateProductRequestDto(req.body);
      const result = await productService.update(productId, shopId, data);

      sendSuccess(res, result, "Cap nhat san pham thanh cong!");
    },
  );

  deleteProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Nguoi dung khong co cua hang!");
      const productId = req.params.id as string;

      const result = await productService.deleteProduct(shopId, productId);

      sendSuccess(res, result, "Xoa san pham thanh cong!");
    },
  );
  
  updateProductStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const statusValidated = updateShopProductStatusRequestDto(req.body);

      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Nguoi dung khong co cua hang!");
      const productId = req.params.id as string;

      const result = await productService.updateProductStatus(
        shopId,
        productId,
        statusValidated,
      );

      sendSuccess(res, result, "Cap nhat trang thai san pham thanh cong!");
    },
  );
}

export default new ProductController();
