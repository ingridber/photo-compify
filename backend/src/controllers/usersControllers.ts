import { Request, Response } from "express";
import bcrypt = require("bcrypt");
import { User } from "../models/User";
import verifyPassword from "../utils/passwordVerifier";

export async function changeUsername(req: Request, res: Response) {
    const userId = (req as any).user.id; 
    const { newUsername } = req.body;

    if (!newUsername) {
        return res.status(400).json({ message: "Need to provide a username" });
    }

    if (newUsername.length < 3 || newUsername.length > 80) {
        return res.status(400).json({ 
            message: "Username must be between 3 and 80 characters" 
        });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username: newUsername },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

export async function changePassword(req: Request, res: Response) {
    const userId = (req as any).user.id; 
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Need to fill both fields" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 8 || newPassword.length > 120) {
        return res.status(400).json({ 
            message: "Password must be between 8 and 120 characters" 
        });
    }

    if (!verifyPassword(newPassword)) {
        return res.status(400).json({ 
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

export async function changeProfilePicture(req: Request, res: Response) {
    res.status(200).json({ message: "Profile picture updated" });
}

export function logout(req: Request, res: Response) {
    res.clearCookie("token"); 
    res.status(200).json({ message: "Logged out" });
}

export async function deleteUser(req: Request, res: Response) {
    const userId = (req as any).user.id;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}