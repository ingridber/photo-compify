import express from "express";
import { authenticateToken } from "../middleware/auth";
import { AuthRequest } from "../types";
import type { Response } from "express";

const routerProfile = express.Router();

routerProfile.get("/profile", authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({
        message: "Authenticated",
        user: req.user
    });
});

export {routerProfile};
