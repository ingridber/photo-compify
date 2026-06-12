import express from "express";
import { createReport, checkNoPreviousReport, getReports, reportUser, hardAcceptReport, declineReport, clearEvidenceImgRef } from "../controllers/reportController";
import { reportRateLimit } from "../middleware/rateLimiter";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const routerReport = express.Router();

routerReport.post("/create", reportRateLimit, createReport);
routerReport.post("/check", reportRateLimit, checkNoPreviousReport);

routerReport.get("/", authenticateToken, requireRole(["admin"]), getReports);
routerReport.patch("/:id", authenticateToken, requireRole(["admin"]), reportUser);
routerReport.patch("/accept/:id", authenticateToken, requireRole(["admin"]), hardAcceptReport);
routerReport.patch("/decline/:id", authenticateToken, requireRole(["admin"]), declineReport)
routerReport.patch("/clear/:id", authenticateToken, requireRole(["admin"]), clearEvidenceImgRef)

export {routerReport};