import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import verifyPassword from "../utils/passwordVerifier";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const NODE_ENV = process.env.NODE_ENV;

export async function register(req: Request, res: Response): Promise<Response> {
    const { name, email, profilePicture, username, password } = req.body;

    const isAsciiOnly = /^[^\u0080-\uFFFF]+$/;
    if (!username || !isAsciiOnly.test(username)) return res.status(400).json({ message: "enter a valid username", code: "INVALID_USERNAME" });

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(409).json({
            message: "user already exists",
            code: "USER_ALREADY_REGISTERED"
        });
    };

    if (!password || password.length > 128 || password.length < 8) {
        return res.status(400).json({
            message: "password must be between 8 and 128 charachters",
            code: "BAD_PASSWORD"
        });
    };

    if (!verifyPassword(password)) {
        return res.status(400).json({
            message: "password must include at least one capital letter, one number and one symbol",
            code: "BAD_PASSWORD"
        });
    };

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        name: name,
        email: email,
        profilePicture: profilePicture,
        username: username,
        password: passwordHash
    });
    await user.save();

    return res.status(201).json({
        data: user.username
    });
};

// --------------------------------------
// ---------- LOGIN CONTROLLER ----------
// --------------------------------------
export async function login(req: Request, res: Response): Promise<Response> {
    // Get username and password
    const { username, password } = req.body;

    // ---------- KONTROLLERA INPUT ----------
    // ---------------------------------------
    if (!username || !password) {
        return res.status(400).json({
            code: "MISSING_CREDENTIALS",
            message: "Username and password are required",
            status: 400
        });
    };

    // Get user from db
    const user = await User.findOne({ username });

    // ---------- KONTROLLERA KONTOT LÅST? ----------
    // ----------------------------------------------
    if (user?.lockUntil && user.lockUntil > new Date()) {
        return res.status(423).json({
            code: "ACCOUNT_LOCKED",
            message: "Too many failed logins, try again in 1h",
            status: 423
        });
    };

    const dummyHash = "ijklmnopqrstuv$2b$10$abcdefgh"
    const hashToCheck = user ? user.password : dummyHash;
    const valid = await bcrypt.compare(password, hashToCheck);

    // ---------- KONTROLLERA ANVÄNDARE FINNS OCH LÖSENORD MATCHAR ----------
    // ---------------- LOGGA MISSLYCKADE INLOGGNINGSFÖRSÖK -----------------
    // ----------------------------------------------------------------------
    if (!user || !valid) {
        // ---------- Logga misslyckade inloggningsförsök ----------
        if (user) {
            user.loginAttempts++;

            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 60 * 60 * 1000);
                // user.lockUntil = new Date(Date.now() + 2 * 60 * 1000)
                user.loginAttempts = 0;
            };

            await user.save();
        };

        return res.status(401).json({
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials, email or password is incorrect",
            status: 401
        });
    };

    // ---------- SKAPA TOKEN ----------
    // ---------------------------------
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

    // ---------- SPARA TOKEN ----------
    // ---------------------------------
    res.cookie("token", token, { httpOnly: true, secure: NODE_ENV === "production", sameSite: "strict" })

    // ---------- RESET attempts och datum vid SUCCESS ----------
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return res.status(200).json({
        code: "LOGIN_SUCCESS",
        message: "Login successful",
        status: 200,
        username: user.username,
    });
};
