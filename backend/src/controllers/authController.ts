import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import verifyPassword from "../utils/passwordVerifier";
import { verifyRecaptcha } from "../utils/verifyRecaptcha";
import z from "zod";
import { AuthRequest } from "../types";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const NODE_ENV = process.env.NODE_ENV;


const registerSchema = z.object({
    username: z
        .string({ required_error: "Need to provide a username"})
        .min(3, "Username must be between 3 and 80 characters")
        .max(80, "Username must be between 3 and 80 characters")
        .regex(/^[^\u0080-\uFFFF]+$/, "enter a valid username"),
    password: z
        .string({ required_error: "Password is required"})
        .min(8, { message: "Password must be between 8 and 120 characters"})
        .max(120, { message: "Password must be between 8 and 120 characters"})
        .refine((val) => verifyPassword(val), {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        }),
    confirmPassword: z
        .string({ required_error: "You must confirm your password"})
        .min(1, { message: "Need to fill both fields"}),
    email: z
    .email({ message: "Please enter a valid email adress"})
    .transform((email) => email.trim().toLowerCase()),
    recaptchaToken: z.string({required_error: "RecaptchaToken is missing"}),
    name: z.string().optional(),
    profilePicture: z.string().optional()
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

const loginSchema = z.object({
    username: z
        .string({ message: "Username is required" })
        .min(1, "Need to provide a username"),
    password: z
        .string({ message: "Password is required" })
        .min(1, "need to provide a password")
})


export async function register(req: Request, res: Response): Promise<Response> {

    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
        const message = validation.error.issues[0]?.message ?? "Validation failed";
        return res.status(400).json({
            code: "MISSING CREDENTIALS",
            message: message,
            status: 400
        });
    }

    
    const { name, email, profilePicture, username, password } = validation.data;
    const isHuman = await verifyRecaptcha(validation.data.recaptchaToken);

    if (!isHuman) {
        return res.status(400).json({
            message: "reCaptcha verification failed",
            code: "RECAPTCHA_FAILED"
        });
    }


    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(409).json({
            message: "user already exists",
            code: "USER_ALREADY_REGISTERED"
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
    // 1. Validera indata med Zod 🧼
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
        const message = validation.error.issues[0]?.message ?? "Validation failed";
        return res.status(400).json({
            code: "MISSING CREDENTIALS",
            message: message,
            status: 400
        });
    }

    // 2. Packa upp den säkra datan
    const { username, password } = validation.data;

    // 3. Starta try-catch för databasoperationer 🔌
    try {
        // Hämta användare från databasen
        const user = await User.findOne({ username }).populate("profilePicture");

        // ---------- KONTROLLERA KONTOT LÅST? ----------
        if (user?.lockUntil && user.lockUntil > new Date()) {
            return res.status(423).json({
                code: "ACCOUNT_LOCKED",
                message: "Too many failed logins, try again in 1h",
                status: 423
            });
        }

        const dummyHash = "ijklmnopqrstuv$2b$10$abcdefgh";
        const hashToCheck = user ? user.password : dummyHash;
        const valid = await bcrypt.compare(password, hashToCheck);

        // ---------- KONTROLLERA ANVÄNDARE OCH LÖSENORD ----------
        if (!user || !valid) {
            if (user) {
                user.loginAttempts++;

                if (user.loginAttempts >= 5) {
                    user.lockUntil = new Date(Date.now() + 60 * 60 * 1000);
                    user.loginAttempts = 0;
                }

                await user.save();
            }

            return res.status(401).json({
                code: "INVALID_CREDENTIALS",
                message: "Invalid credentials, username or password is incorrect",
                status: 401
            });
        }

        // ---------- SKAPA OCH SPARA TOKEN ----------
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
        // TODO: change to secure: true when in production
        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });

        // ---------- RESET ATTEMPTS VID SUCCESS ----------
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        // ---------- HÄMTA PROFILE PICTURE ----------
        let profilePicture = null;
        if (user.profilePicture) {
            profilePicture = {
                _id: user.profilePicture._id,
                url: await user.profilePicture.getSignedUrl()
            };
        }

        return res.status(200).json({
            code: "LOGIN_SUCCESS",
            message: "Login successful",
            status: 200,
            _id: user._id,
            username: user.username,
            profilePicture: profilePicture,
            camera: user.camera,
            themes: user.themes,
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            code: "SERVER_ERROR",
            message: "Something went wrong on the server"
        });
    }
}

// --------------------------------------
// ---------- GET CURRENT USER ----------
// --------------------------------------
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
        const userId = req.user?.id;

        const user = await User.findById(userId).populate("profilePicture");

        if (!user) {
            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "User not found"
            });
        }

        let profilePicture = null;

        if (user.profilePicture) {
            profilePicture = {
                _id: user.profilePicture._id,
                url: await user.profilePicture.getSignedUrl()
            };
        }

       return res.status(200).json({
            code: "USER_FETCHED",
            data: {
                _id: user._id,
                username: user.username,
                profilePicture,
                camera: user.camera,
                themes: user.themes,
            }
        });

    } catch (err) {
        return res.status(500).json({
            code: "SERVER_ERROR",
            message: "Something went wrong"
        });
    };
};
