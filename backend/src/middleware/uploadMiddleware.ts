import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: any, cb: any) => {
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
