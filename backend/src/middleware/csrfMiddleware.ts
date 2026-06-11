import type { Request, Response, NextFunction } from "express";
import { doubleCsrf } from "csrf-csrf";
import { HttpError } from "http-errors";

const { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET as string,
    skipCsrfProtection: (req) => !req.cookies.token,
    getSessionIdentifier: (req) => req.cookies.token ?? "",
    cookieName: "x-csrf-token",
    cookieOptions: {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
    },
    getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

export const csrfErrorHandler = (err: HttpError, _req: Request, res: Response, next: NextFunction) => {
    if (err === invalidCsrfTokenError) {
        return res.status(403).json({message: "invalid csrf token"})
    }
    next(err);
}

export { generateCsrfToken, doubleCsrfProtection };
