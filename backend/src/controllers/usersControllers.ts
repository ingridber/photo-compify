import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Submission } from "../models/Submission";
import { Competition } from "../models/Competition";
import verifyPassword from "../utils/passwordVerifier";
import { Image } from "../models/Image";
import { supabase } from "../config/supabase";
import { z } from "zod";





// ---------- CHANGE USERNAME ----------
// -------------------------------------

const changeUsernameSchema = z.object({
    newUsername: z
        .string({ required_error: "Need to provide a username"})
        .min(3, "Username must be between 3 and 80 characters")
        .max(80, "Username must be between 3 and 80 characters")
    });

export async function changeUsername(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const validation = changeUsernameSchema.safeParse(req.body);

    if (!validation.success) {
        const message = validation.error.issues?.[0]?.message ?? "validation failed";
        return res.status(400).json({ message });
    }

    const { newUsername } = validation.data;

    try {

        const existingUser = await User.findOne({ username: newUsername })

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
            username: updatedUser.username
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// ---------- CHANGE PASSWORD ----------
// -------------------------------------

const changePasswordSchema = z.object({
    password: z
        .string()
        .min(1, {message: "Please provide current password for validation"}),
    newPassword: z
        .string()
        .min(8, { message: "Password must be between 8 and 120 characters"})
        .max(120, { message: "Password must be between 8 and 120 characters"})
        .refine((val) => verifyPassword(val), {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        }),
    confirmPassword: z
        .string()
        .min(1, { message: "Need to fill both fields"})
})
.refine((data) => data.password !== data.newPassword, {
    message: "New password may not be the same as the old password",
    path: ["password"]
})
.refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});


export async function changePassword(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
        const message = validation.error.issues?.[0]?.message ?? "validation failed";
        return res.status(400).json({ message });
    }

    const { password, newPassword } = validation.data;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "User not found",
                status: 404
            });
        };

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).json({
                code: "NOT_VALID",
                message: "Old password doesn't match",
                status: 400
            });
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated" });

    } catch (err) {
        return res.status(500).json({ message: "Server error", err });
    }

};

// ---------- CHANGE PROFILE PIC ----------
// ----------------------------------------

const changeProfilePictureSchema = z.object({
    profilePicture: z
        .string({ required_error: "User not found"}),
    oldProfilePicture: z
        .string()
        .optional()
});

export async function changeProfilePicture(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const validation = changeProfilePictureSchema.safeParse(req.body);

    if(!validation.success) {
        const message = validation.error.issues?.[0]?.message ?? "validation failed";
        return res.status(400).json({ message });
    }

    const { profilePicture, oldProfilePicture } = validation.data;

    try {
        // ---------- UPDATE USER ----------
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: profilePicture },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        };

        // ---------- DELETE OLD IMG ----------
        if (oldProfilePicture) {
            const oldImage = await Image.findById(oldProfilePicture);

            if (oldImage) {
                // ---------- DELETE FROM SUPABASE ----------
                await supabase.storage
                    .from("images")
                    .remove([oldImage.filename]);
                // ---------- DELETE FROM MONGODB ----------
                await Image.findByIdAndDelete(oldProfilePicture);
            };
        };

        res.status(200).json({
            message: "Profile picture updated"
        });

    } catch (error) {
        console.log("CHANGE PROFILE PICTURE ERROR: usersControllers.ts", error);

        res.status(500).json({
            message: "Server error",
            error
        });
    };
};

// ---------- DELETE PROFILE PICTURE ----------
// --------------------------------------------
export async function deleteProfilePicture(req: Request, res: Response) {
    const userId = (req as any).user.id;

    try {
        // ---------- GET USER ----------
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        };

        // ---------- CHECK PROFILE PICTURE ----------
        if (!user.profilePicture) {
            return res.status(404).json({
                message: "No profile picture found"
            });
        };

        // ---------- GET IMAGE ----------
        const image = await Image.findById(user.profilePicture);

        if (image) {
            // ---------- DELETE FROM SUPABASE ----------
            await supabase.storage
                .from("images")
                .remove([image.filename]);

            // ---------- DELETE FROM MONGODB ----------
            await Image.findByIdAndDelete(image._id);
        };

        // ---------- REMOVE PROFILE PICTURE FROM USER ----------
        user.profilePicture = null;

        await user.save();

        return res.status(200).json({
            message: "Profile picture deleted"
        });

    } catch (err) {
        console.log("DELETE PROFILE PICTURE ERROR: usersControllers.ts", err);
        return res.status(500).json({
            message: "Server error",
            err
        });
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

const deleteUserSchema = z.object({
    password: z 
        .string({ required_error: "please provide current password for validation"})
        .min(1, {message: "please provide current password for validation"})
});

export async function deleteUser(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const validation = deleteUserSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            message: validation.error.issues[0].message
        });
    }

    const { password } = validation.data;

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
        const profileImage = await Image.findById(user.profilePicture);

        if (profileImage) {
            // ---------- DELETE FROM SUPABASE ----------
            await supabase.storage
                .from("images")
                .remove([profileImage.filename]);

            // ---------- DELETE FROM MONGODB ----------
            await Image.findByIdAndDelete(profileImage._id);
        };

        const submissions = await Submission.find({ user: userId });
        const submissionIds = submissions.map(s => s._id);
        const submissionImageIds = submissions.map(s => s.image);

        const submissionImages = await Image.find({ _id: { $in: submissionImageIds } });
        const filenames = submissionImages.map(img => img.filename);

        if (filenames.length > 0) {
            const { error } = await supabase.storage
                .from("images")
                .remove(filenames);
            if (error) throw new Error(`Supabase deletion failed: ${error.message}`);
        }

        await Image.deleteMany({ _id: { $in: submissionImageIds } });

        await Competition.updateMany(
            { submissions: { $in: submissionIds } },
            { $pull: { submissions: { $in: submissionIds } } }
        );

        await Submission.updateMany(
            { votes: userId },
            { $pull: { votes: userId } }
        );

        await Submission.deleteMany({ user: userId });

        await Competition.updateMany(
            { owner: userId },
            { $set: { owner: null } }
        );

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