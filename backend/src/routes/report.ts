import express from "express";
import { createReport, checkNoPreviousReport, getReports, reportUser, resolveReport } from "../controllers/reportController";
import { reportRateLimit } from "../middleware/rateLimiter";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const routerReport = express.Router();

routerReport.post("/create", reportRateLimit, createReport);
routerReport.post("/check", reportRateLimit, requireRole(["admin"]), checkNoPreviousReport);
routerReport.get("/", authenticateToken, requireRole(["admin"]), getReports);
routerReport.patch("/:id", authenticateToken, requireRole(["admin"]), reportUser);
routerReport.patch("/resolve/:id", authenticateToken, requireRole(["admin"]), resolveReport);

export {routerReport};