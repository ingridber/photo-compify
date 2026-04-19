import rateLimit from "express-rate-limit";

export const competitionsRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min 
    max: 100, // max 100 requests per IP
    message: "Too many requests, try again later"
});