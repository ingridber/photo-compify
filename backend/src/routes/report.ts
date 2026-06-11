import express from "express";
import { createReport, checkNoPreviousReport, getReports, reportUser, hardAcceptReport, declineReport, clearEvidenceImgRef } from "../controllers/reportController";
import { reportRateLimit } from "../middleware/rateLimiter";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const routerReport = express.Router();

routerReport.post("/create", reportRateLimit, createReport);
routerReport.post("/check", reportRateLimit, checkNoPreviousReport);

// ALLT NEDAN -> requireRole : LÄGG TILLBAKA
routerReport.get("/", authenticateToken, getReports);
routerReport.patch("/:id", authenticateToken, reportUser);
routerReport.patch("/accept/:id", authenticateToken, hardAcceptReport);
routerReport.patch("/decline/:id", authenticateToken, declineReport)
routerReport.patch("/clear/:id", authenticateToken, clearEvidenceImgRef)

export {routerReport};