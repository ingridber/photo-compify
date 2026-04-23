import rateLimit from "express-rate-limit";

export const uploadRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: {
    message: "You can only upload 3 images per day"
  },
  standardHeaders: true,
  legacyHeaders: false
});