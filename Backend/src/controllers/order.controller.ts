import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { orderRequestDto } from "../dtos/order";

class OrderController {
  checkout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const checkoutData = orderRequestDto(req.body);

      const data = await 
    },
  );
}

export default new OrderController();
