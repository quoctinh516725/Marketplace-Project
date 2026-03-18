import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ValidationError } from "../error/AppError";
import cartService, { CartIdentify } from "../services/cart/cart.service";
import { randomUUID } from "node:crypto";
import { env } from "node:process";
import { CacheTTL } from "../cache/cache.ttl";
import { sendSuccess } from "../utils/response";

class CartController {
  private identifyUser = (req: Request, res: Response): CartIdentify => {
    const userId = req.user?.userId;
    let guestId = req.cookies.guestId;
    if (userId) return { type: "user", id: userId };

    if (!guestId) {
      guestId = randomUUID();
      res.cookie("guestId", guestId, {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        maxAge: CacheTTL.cart.guest * 1000,
      });
    }

    return { type: "guest", id: guestId };
  };

  addToCart = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const identify = this.identifyUser(req, res);
      const { quantity, variantId } = req.body;
      if (!quantity || !variantId)
        throw new ValidationError("Vui lòng truyền đầy đủ thông tin!");

      if (typeof quantity !== "number" || quantity < 0) {
        throw new ValidationError("Số lượng không được phép âm!");
      }

      const data = await cartService.addToCart(identify, variantId, quantity);

      sendSuccess(res, data, "Thêm vào giỏ hàng thành công!");
    },
  );

  getCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const identify = this.identifyUser(req, res);

    const data = await cartService.getCart(identify);
    sendSuccess(res, data, "Lấy danh sách giỏ hàng thành công!");
  });

  updateQuantity = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const identify = this.identifyUser(req, res);
      const variantId = req.params.id as string;
      const { quantity } = req.body;

      if (!quantity) throw new ValidationError("Vui lòng cung cấp số lượng!");
      if (typeof quantity !== "number")
        throw new ValidationError("Số lượng phải là số nguyên!");

      const data = await cartService.updateQuantity(
        identify,
        variantId,
        quantity,
      );

      let message = "";

      if (data === 1) {
        message = "Đã xóa giỏ hàng với số lượng là 0!";
      } else if (data === -1) {
        message = "Số lượng sản phẩm tồn kho không đủ!";
      } else if (data === null) {
        message = "Sản phẩm không tồn tại!";
      } else {
        message = "Cập nhật số lượng giỏ hàng thành công!";
      }

      sendSuccess(res, data, message);
    },
  );

  removeCart = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const identify = this.identifyUser(req, res);
      const variantId = req.params.id as string;

      const data = await cartService.removeItem(identify, variantId);

      let message =
        data === 1
          ? "Đã xóa giỏ hàng thành công!"
          : "Xóa thất bại. Vui lòng thử lại sau!";

      sendSuccess(res, data, message);
    },
  );
}
export default new CartController();
