import { Router } from "express";
import {register} from "../controllers/authController";

export const authRouter = Router();

authRouter.post("/register", register);
