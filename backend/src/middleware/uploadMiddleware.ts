import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: any, cb: any) => {
  const allowedTypes = [ "image/jpeg", "image/png", "image/webp"];
// "image/jpeg",
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
