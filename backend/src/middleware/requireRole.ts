import { Request, Response, NextFunction } from "express";

type Role = "user" | "moderator" | "admin";
// Definierar vilka roller som finns i systemet

export function requireRole(roles: Role[]) {
    // Middleware som tar emot vilka roller som är tillåtna

    return (req: Request, res: Response, next: NextFunction) => {
        // Returnerar själva middleware-funktionen

        const user = (req as any).user;
        // Hämtar inloggad användare från request

        if (!user) {
            // Om ingen användare finns → inte inloggad

            return res.status(401).json({
                code: "NO_USER",
                message: "Not authenticated",
                status: 401
            });
        }

        if (!roles.includes(user.role)) {
            // Kollar om användarens roll INTE finns bland tillåtna roller

            return res.status(403).json({
                code: "FORBIDDEN",
                message: "Insufficient rights",
                status: 403
            });
        }

        next();
    };
}