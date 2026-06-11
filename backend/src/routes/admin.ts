import express from "express";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import {deleteCompetition, updateCompetition, adminSetCompetitionPhase} from "../controllers/competitionsController";
import { deleteImage } from "../controllers/imageController";
import { deleteUserById } from "../controllers/requireRoleController";
import { getAllUsers, updateUserRole } from "../controllers/adminUsersController";

const adminRouter = express.Router();

adminRouter.use(authenticateToken);
adminRouter.use(requireRole(["admin"]));

// Admin controll for competitions
adminRouter.delete("/competitions/:id", deleteCompetition);
adminRouter.patch("/competitions/:id", updateCompetition);
adminRouter.patch("/competitions/:id/phase", adminSetCompetitionPhase);

// Admin controll for images
adminRouter.delete("/images/:id", requireRole(["moderator", "admin"]),deleteImage);

// Admin controll for users
adminRouter.delete("/users/:id", authenticateToken, requireRole(["admin"]), deleteUserById);
adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:id/role", updateUserRole);

export default adminRouter;