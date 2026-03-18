import { ValidationError } from "../../error/AppError";

export interface CreateReviewRequest {
  orderItemId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export const createReviewRequest = (data: any): CreateReviewRequest => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ");
  }

  const { orderItemId, rating, comment } = data;

  if (!orderItemId || typeof orderItemId !== "string") {
    throw new ValidationError("orderItemId là bắt buộc và phải là chuỗi");
  }

  if (
    rating === undefined ||
    typeof rating !== "number" ||
    !Number.isInteger(rating)
  ) {
    throw new ValidationError("rating là bắt buộc và phải là số nguyên");
  }

  if (rating < 1 || rating > 5) {
    throw new ValidationError("rating phải từ 1 đến 5");
  }

  if (
    comment !== undefined &&
    (typeof comment !== "string" || comment.length > 1000)
  ) {
    throw new ValidationError(
      "comment phải là chuỗi với độ dài tối đa 1000 ký tự",
    );
  }

  return {
    orderItemId,
    rating,
    comment,
  };
};

export const updateReviewRequest = (data: any): UpdateReviewRequest => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ");
  }

  const { rating, comment } = data;

  if (rating !== undefined) {
    if (typeof rating !== "number" || !Number.isInteger(rating)) {
      throw new ValidationError("rating phải là số nguyên");
    }
    if (rating < 1 || rating > 5) {
      throw new ValidationError("rating phải từ 1 đến 5");
    }
  }

  if (
    comment !== undefined &&
    (typeof comment !== "string" || comment.length > 1000)
  ) {
    throw new ValidationError(
      "comment phải là chuỗi với độ dài tối đa 1000 ký tự",
    );
  }

  return {
    rating,
    comment,
  };
};
