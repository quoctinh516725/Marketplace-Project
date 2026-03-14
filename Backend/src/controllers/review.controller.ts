import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import reviewService from "../services/review.service";
import { sendSuccess } from "../utils/response";
import { createReviewRequest, updateReviewRequest } from "../dtos/review";

class ReviewController {
  createReview = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;
      const validatedData = createReviewRequest(req.body);
      const { orderItemId, rating, comment } = validatedData;

      const result = await reviewService.createReview(
        userId,
        orderItemId,
        rating,
        comment,
      );
      sendSuccess(res, result, "Đánh giá đã được tạo thành công");
    },
  );

  getProductReviews = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { productId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await reviewService.getProductReviews(
        productId as string,
        page,
        limit,
      );
      sendSuccess(res, result, "Đánh giá sản phẩm đã được lấy thành công");
    },
  );

  updateReview = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;
      const { id } = req.params;
      const validatedData = updateReviewRequest(req.body);

      const result = await reviewService.updateReview(
        userId,
        id as string,
        validatedData,
      );
      sendSuccess(res, result, "Đánh giá đã được cập nhật thành công");
    },
  );

  deleteReview = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user!;
      const { id } = req.params;
      // Check if user is admin
      const isAdmin = user.roles?.includes("ADMIN") || false;

      const result = await reviewService.deleteReview(
        user.userId,
        id as string,
        isAdmin,
      );
      sendSuccess(res, result, "Đánh giá đã được xóa thành công");
    },
  );

  getReviewById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const result = await reviewService.getReviewById(id as string);
      sendSuccess(res, result, "Đánh giá đã được lấy thành công");
    },
  );
}

export default new ReviewController();
