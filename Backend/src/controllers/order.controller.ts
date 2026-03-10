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
      const ipAddr =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
        req.socket.remoteAddress ||
        req.ip ||
        "127.0.0.1";

      const data = await orderService.createOrder(userId, checkoutData, ipAddr);
      sendSuccess(res, data, "Tạo đơn hàng thành công!");
    },
  );
}

export default new OrderController();
