import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../types";

const JWT_SECRET = process.env.JWT_SECRET as string;


// ------------------------------------------------------
// ---------- UNAUTHORIZED? You shall not pass ----------
// ------------------------------------------------------
export function authenticateToken(req : AuthRequest, res: Response, next: NextFunction) {

    // ---------- HÄMTA TOKEN OM DEN FINNS I COOKIES ----------
    // --------------------------------------------------------
    const cookieToken = req.cookies?.token;

    // ---------- SÄTT TOKEN ----------
    // --------------------------------
    const token = cookieToken;

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
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            role: "user" | "moderator" | "admin";
        };
        req.user = decoded;

        next();
    } catch(err) {
        return res.status(403).json({
            code: "INVALID_TOKEN",
            message: "Token is invalid or expired",
            status: 403
        });
    };
};

export function extractUser(req: AuthRequest, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.token;
  const token = cookieToken;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
         id: string;
        role: "user" | "moderator" | "admin";
        };
    req.user = decoded;
    
  } catch {
    // invalid token — continue without user
  }
  next();
}
