import { Request, Response } from "express";
import shopService from "../../services/shop/seller/shop.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { NotFoundError, ValidationError } from "../../error/AppError";
import { uploadStream } from "../../utils/uploadStream";
import ShopValidation from "../../validations/shop.validation";

class ShopController {
  getMyShop = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sellerId = req.user?.userId as string;
      const result = await shopService.getMyShop(sellerId);

      sendSuccess(res, result, "Lấy thông tin cửa hàng thành công!");
    },
  );

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = ShopValidation.createShopValidation(req.body);

    const sellerId = req.user?.userId as string;
    const result = await shopService.createShop(sellerId, data);

    sendSuccess(res, result, "Tạo shop thành công. Vui lòng chờ được duyệt!");
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, address, phone, slug, description, status } = req.body;
    const sellerId = req.user?.userId as string;
    const shopId = req.user?.shopId;
    if (!shopId) throw new NotFoundError("Bạn chưa có Shop!");
    const result = await shopService.updateShop(sellerId, shopId, {
      name,
      address,
      phone,
      slug,
      description,
      status,
    });
    sendSuccess(res, result, "Chỉnh sửa thông tin shop thành công!");
  });

  updateLogo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sellerId = req.user?.userId as string;
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Bạn chưa có Shop!");

      const file = req.file;
      if (!file) throw new ValidationError("Không có ảnh được chọn!");

      const result: any = await uploadStream(file, {
        folder: `marketplace/shop/${shopId}/logo`,
        publicId: "logo",
        overwrite: true,
      });

      await shopService.updateLogo(sellerId, shopId, result.secure_url);
      sendSuccess(
        res,
        { url: result.secure_url, public_id: result.public_id },
        "Chỉnh sửa logo thành công!",
      );
    },
  );
  updateBackground = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sellerId = req.user?.userId as string;
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Bạn chưa có Shop!");

      const file = req.file;
      if (!file) throw new ValidationError("Không có ảnh được chọn!");

      const result: any = await uploadStream(file, {
        folder: `marketplace/shop/${shopId}/background`,
        publicId: "background",
        overwrite: true,
      });

      await shopService.updateBackground(sellerId, shopId, result.secure_url);
      sendSuccess(
        res,
        { url: result.secure_url, public_id: result.public_id },
        "Chỉnh sửa background thành công!",
      );
    },
  );
}

export default new ShopController();
