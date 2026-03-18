import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import orderService from "../../services/order/order.service";
import { OrderStatus } from "../../constants/orderStatus";
import { ValidationError } from "../../error/AppError";

class OrderController {
  getShopOrders = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId as string;
      const { page, limit } = req.pagination!;

      const data = await orderService.getShopOrders(shopId, {
        page,
        limit,
        search: req.query.search as string,
        status: req.query.status as string,
      });

      sendSuccess(res, data, "Lấy danh sách đơn hàng thành công!");
    },
  );

  updateSubOrderStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId as string;
      const subOrderId = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        throw new ValidationError("Trạng thái đơn hàng không hợp lệ!");
      }

      const allowedStatus = [OrderStatus.SHIPPING];
      if (!allowedStatus.includes(status)) {
        throw new ValidationError("Trạng thái đơn hàng không hợp lệ!");
      }

      const updatedSubOrder = await orderService.updateSubOrderStatus(
        subOrderId,
        shopId,
        status,
      );
      sendSuccess(
        res,
        updatedSubOrder,
        "Cập nhật trạng thái đơn hàng thành công!",
      );
    },
  );

  handleRefundRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const shopId = req.user?.shopId as string;
      const refundId = req.params.id as string;
      const { action } = req.body;
      if (action !== "APPROVE" && action !== "REJECT") {
        throw new ValidationError("Hành động không hợp lệ!");
      }

      await orderService.handleRefundRequest(shopId, refundId, action);
      sendSuccess(res, null, "Xử lý yêu cầu hoàn tiền thành công!");
    },
  );
}
export default new OrderController();
