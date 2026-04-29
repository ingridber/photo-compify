import { Router } from "express";
import {register, login, getCurrentUser} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticateToken, getCurrentUser);
