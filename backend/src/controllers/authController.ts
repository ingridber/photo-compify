import {Request, Response} from "express";
import {User} from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const NODE_ENV = process.env.NODE_ENV;

export async function register(req: Request, res: Response): Promise<Response> {
    const { username, password } = req.body;

    if (!username) return res.status(400).json({ message: "email must be a valid email", code: "INVALID_EMAIL" });

    if (!password || password.length > 128 || password.length < 8) {
        return res.status(400).json({
            message: "password must be between 8 and 128 charachters",
            code: "BAD_PASSWORD"
        });
    };

    const existingUser = await User.findOne({ username });

    if (existingUser) {
        return res.status(409).json({
            message: "user already exists",
            code: "USER_ALREADY_REGISTERED"
        });
    };

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        username: username,
        password: passwordHash
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

    res.cookie("token", token, { httpOnly: true, secure: NODE_ENV === "production", sameSite: "strict" })

    return res.status(201).json({
        data: user.email
    });
};
