import express from "express";
import { createReport } from "../controllers/reportController";
import { reportRateLimit } from "../middleware/rateLimiter";

const routerReport = express.Router();

routerReport.post("/", reportRateLimit, createReport);

export {routerReport};