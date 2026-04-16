import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;


// ------------------------------------------------------
// ---------- UNAUTHORIZED? You shall not pass ----------
// ------------------------------------------------------
export function authenticateToken(req : Request, res: Response, next: NextFunction) {

    // ---------- KONTROLLERA TOKEN i HEADER?? ----------
    // --------------------------------------------------
    const authHeader = req.headers["authorization"];
    const headerToken = authHeader && authHeader.split(" ")[1];

    // ---------- HÄMTA TOKEN OM DEN FINNS I COOKIES ----------
    // --------------------------------------------------------
    const cookieToken = req.cookies?.token;

    // ---------- SÄTT TOKEN ----------
    // --------------------------------
    const token = headerToken || cookieToken;

    // ---------- KOLLA TOKEN ----------
    // ---------------------------------
    if(!token) {
        return res.status(401).json({
            code: "NO_TOKEN",
            message: "No token found",
            status: 401
        });
    };

    // ---------- VERIFIERA TOKEN ----------
    // -------------------------------------
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {id: string};
        (req as any).user = decoded;

        next();
    } catch(err) {
        return res.status(403).json({
            code: "INVALID_TOKEN",
            message: "Token is invalid or expired",
            status: 403
        });
    };
};