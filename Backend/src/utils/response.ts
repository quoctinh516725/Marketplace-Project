import { Response } from "express";
import { PaginationDto } from "../dtos";

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationDto;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationDto;
  stack?: string;
}

function isPagination<T>(payload: T | PaginatedResponse<T>) {
  return (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "pagination" in payload
  );
}

export function sendSuccess<T>(
  res: Response,
  payload: T | PaginatedResponse<T>,
  message: string,
  statusCode: number = 200,
): Response {
  if (isPagination(payload)) {
    const response: ApiResponse<T[]> = {
      success: true,
      data: payload.data,
      pagination: payload.pagination,
      message,
    };

    return res.status(statusCode).json(response);
  }

  const response: ApiResponse<T> = {
    success: true,
    data: payload,
    message,
  };

  return res.status(statusCode).json(response);
}

export function sendError<T>(
  res: Response,
  message: string,
  statusCode: number = 500,
  stack?: string,
): Response {
  const response: ApiResponse<T> = {
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && stack && { stack }),
  };

  return res.status(statusCode).json(response);
}
