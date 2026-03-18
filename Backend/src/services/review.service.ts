import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../error/AppError";
import reviewRepository, {
  CreateReviewData,
  UpdateReviewData,
} from "../repositories/review.repository";
import { prisma } from "../config/prisma";
import orderRepository from "../repositories/order.repository";

class ReviewService {
  createReview = async (
    userId: string,
    orderItemId: string,
    rating: number,
    comment?: string,
  ) => {
    // Find order item and verify ownership
    const orderItem = await orderRepository.findOrderItemById(orderItemId);

    if (!orderItem) {
      throw new NotFoundError("Không tìm thấy sản phẩm trong đơn hàng");
    }

    // Verify user owns this order item
    if (orderItem.subOrder.masterOrder.userId !== userId) {
      throw new ForbiddenError(
        "Bạn chỉ có thể đánh giá sản phẩm từ đơn hàng của mình",
      );
    }

    // Check if sub order is delivered
    if (orderItem.subOrder.status !== "DELIVERED") {
      throw new ValidationError(
        "Bạn chỉ có thể đánh giá sản phẩm đã được giao",
      );
    }

    // Check if review already exists
    const existingReview = await reviewRepository.findByOrderItem(orderItemId);
    if (existingReview) {
      throw new ValidationError("Bạn đã đánh giá sản phẩm này rồi");
    }

    // Create review
    const reviewData: CreateReviewData = {
      userId,
      productId: orderItem.productId,
      orderItemId,
      rating,
      comment,
    };

    return await reviewRepository.create(reviewData);
  };

  getProductReviews = async (
    productId: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1 || limit > 50) limit = 10;

    return await reviewRepository.findByProduct(productId, page, limit);
  };

  updateReview = async (
    userId: string,
    reviewId: string,
    data: UpdateReviewData,
  ) => {
    const { rating, comment } = data;

    // Find review
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Không tìm thấy đánh giá");
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenError("Bạn chỉ có thể cập nhật đánh giá của mình");
    }

    // Update review
    const updateData: UpdateReviewData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    return await reviewRepository.update(reviewId, updateData);
  };

  deleteReview = async (
    userId: string,
    reviewId: string,
    isAdmin: boolean = false,
  ) => {
    // Find review
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Không tìm thấy đánh giá");
    }

    // Verify ownership or admin permission
    if (review.userId !== userId && !isAdmin) {
      throw new ForbiddenError("Bạn chỉ có thể xóa đánh giá của mình");
    }

    await reviewRepository.delete(reviewId);
    return { message: "Đánh giá đã được xóa thành công" };
  };

  getReviewById = async (reviewId: string) => {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Không tìm thấy đánh giá");
    }
    return review;
  };
}

export default new ReviewService();
