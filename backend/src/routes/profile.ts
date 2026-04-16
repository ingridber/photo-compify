import express from "express";
import { authenticateToken } from "../middleware/auth";

const routerProfile = express.Router();

routerProfile.get("/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Authenticated",
        user: (req as any).user
    });
});

export {routerProfile};
