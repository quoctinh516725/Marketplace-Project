import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import ShopService from "../../services/public/shop.service";

class ShopController {
  getShopBySlug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const slug = req.params.slug as string;
      const data = await ShopService.getShopBySlug(slug);
      sendSuccess(res, data, "Lấy thông tin cửa hàng thành công!");
    },
  );
}

export default new ShopController();
