import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import verifyPassword from "../utils/passwordVerifier";


// ---------- CHANGE USERNAME ----------
// -------------------------------------
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

        const existingUser = await User.findOne({username: newUsername})

        if (existingUser) {
            return res.status(409).json({
                code: "USER_ALREADY_EXIST",
                message: "Username is already taken",
                status: 409
            });
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username: newUsername },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Username updated",
            username: updatedUser.username});

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// ---------- CHANGE PASSWORD ----------
// -------------------------------------
export async function changePassword(req: Request, res: Response) {
    const userId = (req as any).user.id; 
    const { password, newPassword, confirmPassword } = req.body;

    if(password === newPassword) {
        return res.status(400).json({
            code: "BAD_DATA",
            message: "New password must be different from the old password",
            status: 400
        });
    };

    if(!password) {
        return res.status(400).json({
            code: "MISSING_PASSWORD",
            message: "Please provide current password for validation",
            status: 400, 
        });
    };

    try {
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "User not found",
                status: 404
            });
        };
        
        const valid = await bcrypt.compare(password, user.password);

        if(!valid) {
            return res.status(400).json({
                code: "NOT_VALID",
                message: "Old password doesn't match",
                status: 400
            });
        };
  
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

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({message: "Password updated"});

    } catch (err) {
        return res.status(500).json({ message: "Server error", err });
    }

};

// ---------- CHANGE PROFILE PIC ----------
// ----------------------------------------
export async function changeProfilePicture(req: Request, res: Response) {

    const userId = (req as any).user.id; 
    // SKIKCA MED !!
    const {profilePicture} = req.body;

    try {
        console.log("this is the profile pic", profilePicture);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: profilePicture },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "Profile picture updated"});

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// ---------- LOGOUT SESSION ----------
// ------------------------------------
export function logout(req: Request, res: Response) {
    res.clearCookie("token"); 
    res.status(200).json({ message: "Logged out" });
}

// ---------- DELETE ACCOUNT ----------
// ------------------------------------
export async function deleteUser(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const {password} = req.body;

    if(!password) {
        return res.status(400).json({
            code: "MISSING_PASSWORD",
            message: "Please provide current password for validation",
            status: 400, 
        });
    };

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "User not found",
                status: 404
            });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).json({
                code: "NOT_VALID",
                message: "Password is incorrect",
                status: 400
            });
        }

        await User.findByIdAndDelete(userId);
        res.clearCookie("token");

        return res.status(200).json({
            message: "Account deleted successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            err
        });
    };

};
