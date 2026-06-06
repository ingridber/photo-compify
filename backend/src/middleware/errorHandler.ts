import { Request, Response, NextFunction } from "express"
import { AppError } from "../errors/AppError";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {

  // Common Application Errors
  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code
    });
    return;
  }
  // Multer and normal errors
  if (err instanceof Error) {
    res.status(400).json({
      success: false,
      message: err.message
    });
    return;
  }
  // Unknown Errors
  console.error("UNEXPECTED ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Something went wrong"
  });
};
