import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../error/AppError";

declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
      };
      searchQuery?: {
        q?: string;
        categoryIds?: string[];
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
      };
    }
  }
}

export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const pageRaw = req.query.page as string | undefined;
  const limitRaw = req.query.limit as string | undefined;

  const page = pageRaw ? Number(pageRaw) : 1;
  const limit = limitRaw ? Number(limitRaw) : 10;

  if (pageRaw && Number.isNaN(page)) {
    throw new ValidationError("Page phải là số");
  }
  if (limitRaw && Number.isNaN(limit)) {
    throw new ValidationError("Limit phải là số");
  }
  if (page !== undefined && page < 1) {
    throw new ValidationError("Trang phải lớn hơn 0");
  }
  if (limit !== undefined && (limit < 1 || limit > 100)) {
    throw new ValidationError("Giới hạn phải từ 1 đến 100");
  }

  req.pagination = { page, limit };

  next();
};

export const validateSearchProducts = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { q, categoryIds, minPrice, maxPrice, sortBy } = req.query;

  const DEFAULT_MIN_PRICE = 0;
  const DEFAULT_MAX_PRICE = 999_999_999;

  const ALLOWED_SORT = [
    "relevance",
    "price_asc",
    "price_desc",
    "created_at_asc",
    "created_at_desc",
    "rating_asc",
    "rating_desc",
  ];
  const parsedSearch =
    typeof q === "string" && q.trim() !== ""
      ? q.trim()
      : undefined;

  let parsedCategoryIds: string[] | undefined;

  if (categoryIds !== undefined) {
    if (!Array.isArray(categoryIds)) {
      throw new ValidationError("Danh mục phải được truyền dạng danh sách!");
    }
    parsedCategoryIds = categoryIds as string[];
  }

  const parsedMinPrice =
    minPrice !== undefined ? Number(minPrice) : DEFAULT_MIN_PRICE;

  const parsedMaxPrice =
    maxPrice !== undefined ? Number(maxPrice) : DEFAULT_MAX_PRICE;

  if (isNaN(parsedMinPrice) || isNaN(parsedMaxPrice)) {
    throw new ValidationError("minPrice hoặc maxPrice không hợp lệ!");
  }

  if (parsedMinPrice > parsedMaxPrice) {
    throw new ValidationError("minPrice không được lớn hơn maxPrice!");
  }

  const parsedSortBy =
    typeof sortBy === "string" && ALLOWED_SORT.includes(sortBy)
      ? sortBy
      : undefined;

  req.searchQuery = {
    q: parsedSearch,
    categoryIds: parsedCategoryIds,
    minPrice: parsedMinPrice,
    maxPrice: parsedMaxPrice,
    sortBy: parsedSortBy,
  };

  next();
};
