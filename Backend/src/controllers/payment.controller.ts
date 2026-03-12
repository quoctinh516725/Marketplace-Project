import { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import paymentService from "../services/payment/payment.service";

import { asyncHandler } from "../utils/asyncHandler";

class PaymentController {
  getPaymentUrl = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const ipAddr =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    const userId = req.user?.userId!;
    const payment_url = await paymentService.getPaymentUrl(
      orderId as string,
      userId,
      ipAddr,
    );

    sendSuccess(res, { payment_url }, "Lấy liên kết thanh toán thành công!");
  });

  getPaymentReturn = asyncHandler(async (req: Request, res: Response) => {
    const vnp_Params = { ...req.query };
    const result = await paymentService.getPaymentReturn(vnp_Params);

    return sendSuccess(
      res,
      {
        paymentId: result.paymentId,
        responseCode: result.responseCode,
        transactionStatus: result.transactionStatus,
      },
      result.message,
    );
  });

  vnpayIPN = asyncHandler(async (req: Request, res: Response) => {
    const vnp_Params = { ...req.query };
    await paymentService.vnpayIPN(vnp_Params);

    return sendSuccess(res, {}, "Cập nhật thành công!");
  });
}

export default new PaymentController();
