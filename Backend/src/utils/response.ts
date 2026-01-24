import { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  stack?: string;
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
): Response {
  const response: ApiResponse<T> = {
    success: true,
    ...(data && { data }),
    ...(message && { message }),
  };

  return res.status(statusCode).json(response);
}

export function sendError<T>(
  res: Response,
  message: string,
  statusCode: number = 500,
  stack?: string,
): Response {
  const response : ApiResponse<T> = {
    success: false,
    message,
    ...(stack && { stack }),
  };

  return res.status(statusCode).json(response);
}
