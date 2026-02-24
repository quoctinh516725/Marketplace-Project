import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import shopService from "../../services/staff/shop.service";

class ShopController {
  getAllShop = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;

      const result = await shopService.getAllShop({
        page,
        limit,
        status: req.query.status as string,
        search: req.query.search as string,
      });

      sendSuccess(res, result, "Lấy danh sách shop thành công!");
    },
  );
  bannedShop = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.params.shopId as string;
      const staffId = req.user?.userId!;
      const result = await shopService.bannedShop(staffId, shopId);

      sendSuccess(res, result, "Đã khóa cửa hàng thành công!");
    },
  );

  reviewRequestCreateShop = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.params.shopId as string;
      const staffId = req.user?.userId!;
      const { status, reason } = req.body;

      const result = await shopService.reviewRequestCreateShop(
        staffId,
        shopId,
        { status, reason },
      );

      sendSuccess(res, { ...result, reason }, "Đã xử lý yêu cầu tạo shop!");
    },
  );
}

export default new ShopController();
