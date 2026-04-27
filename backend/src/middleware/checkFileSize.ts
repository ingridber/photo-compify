import { Request, Response, NextFunction } from "express";

export function checkFileSize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.file && req.file.size > 1000) {
    return res.status(400).json({
      message: "File size must be less than test limit"
    });
  }

  next();
}