import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../error/AppError";

export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  if (page < 1) {
    throw new ValidationError("Trang phải lớn hơn 0");
  }
  if (limit < 1 || limit > 100) {
    throw new ValidationError("Giới hạn phải lớn hơn 1 và bé hơn 100");
  }

  next();
};
