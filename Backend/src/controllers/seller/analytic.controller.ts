import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { NotFoundError } from "../../error/AppError";
import analyticService from "../../services/analytic/analytic.service";

class AnalyticController {
  getOverview = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Bạn chưa có Shop!");
      const result = await analyticService.getShopOverview(shopId);
      sendSuccess(res, result, "Lấy thống kê cửa hàng thành công!");
    },
  );

  getRevenueByTime = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Bạn chưa có Shop!");
      const range = (req.query.range as string) || "7d";
      const result = await analyticService.getRevenueByTime(shopId, range);
      sendSuccess(
        res,
        result,
        "Lấy dữ liệu doanh thu theo thời gian thành công!",
      );
    },
  );

  getTopProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Bạn chưa có Shop!");
      const result = await analyticService.getTopProducts(shopId);
      sendSuccess(res, result, "Lấy danh sách sản phẩm bán chạy thành công!");
    },
  );

  getOrderStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId;
      if (!shopId) throw new NotFoundError("Bạn chưa có Shop!");
      const result = await analyticService.getOrderStats(shopId);
      sendSuccess(res, result, "Lấy số liệu đơn hàng thành công!");
    },
  );
}

export default new AnalyticController();
