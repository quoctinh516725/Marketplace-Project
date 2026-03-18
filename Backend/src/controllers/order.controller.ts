import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { orderRequestDto } from "../dtos/order";
import orderService from "../services/order/order.service";
import { sendSuccess } from "../utils/response";

class OrderController {
  checkout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId as string;
      const checkoutData = orderRequestDto(req.body);
      const idempotencyKey = req.idempotencyKey!;
      const ipAddr =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
        req.socket.remoteAddress ||
        req.ip ||
        "127.0.0.1";

      const data = await orderService.createOrder(
        userId,
        checkoutData,
        ipAddr,
        idempotencyKey,
      );
      sendSuccess(res, data, "Tạo đơn hàng thành công!");
    },
  );

  getMyOrders = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      console.log(123);
      const userId = req.user?.userId as string;
      const { page, limit } = req.pagination!;

      const data = await orderService.getMyOrders(userId, {
        page,
        limit,
        search: req.query.search as string,
        status: req.query.status as string,
      });

      sendSuccess(res, data, "Lấy danh sách đơn hàng thành công!");
    },
  );

  getSubOrderDetail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const subOrderId = req.params.id as string;
      const userId = req.user?.userId as string;

      const data = await orderService.getSubOrderDetail(subOrderId, userId);
      sendSuccess(res, data, "Lấy chi tiết đơn hàng thành công!");
    },
  );

  cancelSubOrder = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId as string;
      const subOrderId = req.params.id as string;
      const { reason } = req.body;
      const idempotencyKey = req.idempotencyKey!;

      const data = await orderService.cancelSubOrder(
        userId,
        subOrderId,
        reason,
        idempotencyKey,
      );
      sendSuccess(res, data, data.message);
    },
  );

  confirmReceived = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId as string;
      const subOrderId = req.params.id as string;
      const idempotencyKey = req.idempotencyKey!;

      const data = await orderService.confirmReceived(
        userId,
        subOrderId,
        idempotencyKey,
      );
      sendSuccess(res, data, data.message);
    },
  );
}

export default new OrderController();
