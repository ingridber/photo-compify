import rateLimit from "express-rate-limit";

export const RateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min 
    max: 200, // max 100 requests per IP
    message: "Too many requests, try again later"
});

export const reportRateLimit = rateLimit({
    windowMs: 15*60*1000,
    max: 5,
    message: {
        "success": false,
        "message": "Too many reports submitted. Please try again later."
    }
})