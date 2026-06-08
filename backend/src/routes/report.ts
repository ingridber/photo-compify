import express from "express";
import { createReport, checkNoPreviousReport, getReports, reportUser, resolveReport } from "../controllers/reportController";
import { reportRateLimit } from "../middleware/rateLimiter";
import { authenticateToken } from "../middleware/auth";

const routerReport = express.Router();

routerReport.post("/create", reportRateLimit, createReport);
routerReport.post("/check", reportRateLimit, checkNoPreviousReport);
routerReport.get("/", authenticateToken, getReports);
routerReport.patch("/:id", authenticateToken, reportUser);
routerReport.patch("/resolve/:id", authenticateToken, resolveReport);

export {routerReport};