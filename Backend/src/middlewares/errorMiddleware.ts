import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (env.NODE_ENV === "production") {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    console.log("Lỗi hệ thống: ", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi bất định",
    });
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
}
