import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Submission } from "../models/Submission";
import { Competition } from "../models/Competition";
import verifyPassword from "../utils/passwordVerifier";
import { Image } from "../models/Image";
import { supabase } from "../config/supabase";
import { z } from "zod";
import { CompetitionSubmissionInterface } from "../types";
import { calculateUserStats } from "../services/userStats";
import { submissionsIndicator } from "../services/submissionIndicator";




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
        .string( {required_error: "Password is requiered" })
        .min(1, {message: "Please provide current password for validation"}),
    newPassword: z
        .string({required_error: "New password is requiered" })
        .min(8, { message: "Password must be between 8 and 120 characters"})
        .max(120, { message: "Password must be between 8 and 120 characters"})
        .refine((val) => verifyPassword(val), {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        }),
    confirmPassword: z
        .string({required_error: "Please Confirm your new password" })
        .min(1, { message: "Please Confirm your new password"})
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



// ---------- USER COMPS ----------
// --------------------------------
export async function getUserCompetitions(req: Request, res: Response) {
    const userId = (req as any).user.id;

    try {
        // ---------- GET USER ----------
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        };

        // ---------- GET COMPETITIONS ----------
        const competitions = await Competition.find({
            owner: user._id
        })
        .populate("owner", "username")
        .populate("logoBanner");

        // ---------- ADD SIGNED URL ----------
        await Promise.all(

            competitions.map(async (competition: any) => {

                if (competition.logoBanner?.getSignedUrl) {

                    const url =
                        await competition.logoBanner.getSignedUrl();

                    competition._doc.signedLogoUrl = url;
                }
            })
        );

        return res.status(200).json({
            competitions
        });

    } catch (err) {
        console.log("GET USER COMPETITIONS ERROR", err);

        return res.status(500).json({
            message: "Server error",
            err
        });
    };
};

// ---------- USER SUBMITS ----------
// ----------------------------------
export async function getUserSubmissions(
    req: Request,
    res: Response
) {
    const userId = (req as any).user.id;

    try {

        const submissions = await Submission.find({
            user: userId
        })
        .populate("image")
        .populate({
            path: "competition",
            select: "title endDate votingStartDate submissions",
            populate: {
                path: "submissions"
            }
        });

        const formattedSubmissions =
            await submissionsIndicator(submissions);

        const enrichedSubmissions =
            formattedSubmissions.map((submission: any) => ({
                ...submission,

                competitionTitle:
                    submission.competition &&
                    typeof submission.competition === "object" &&
                    "title" in submission.competition
                        ? submission.competition.title
                        : null
            }));

        return res.status(200).json({
            submissions: enrichedSubmissions
        });

    } catch (err) {

        return res.status(500).json({
            message: "Server error",
            err
        });
    }
}



// ------------------------------------
// ---------- PUBLIC PROFILE ----------
// ------------------------------------

export async function getPublicProfile(
    req: Request,
    res: Response
) {

    const { username } = req.params;

    try {

        // ---------- GET USER ----------
        const user = await User.findOne({
            username
        })
        .populate("profilePicture");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }

        // ---------- FORMAT PROFILE PIC ----------
        let profilePicture = null;

        if (
            user.profilePicture &&
            typeof user.profilePicture !== "string" &&
            user.profilePicture.getSignedUrl
        ) {

            profilePicture = {
                _id: user.profilePicture._id,
                url:
                    await user.profilePicture.getSignedUrl()
            };
        }


        // ---------- GET USER SUBMISSIONS ----------
        const submissions = await Submission.find({
            user: user._id
        })
        .populate("image")
        .populate({
            path: "competition",
            populate: {
                path: "submissions"
            }
        });

        // ---------- ONLY FINISHED SUBMISSIONS ----------
        const finishedSubmissions = submissions.filter(
            (submission: any) => {

                if (!submission.competition?.endDate) {
                    return false;
                }

                return (
                    new Date(
                        submission.competition.endDate
                    ).getTime() < Date.now()
                );
            }
        );

        // ---------- FORMAT SUBMISSIONS ----------
        const formattedSubmissions =
            await submissionsIndicator(
                finishedSubmissions
            );

        const enrichedSubmissions =
            formattedSubmissions.map(
                (submission: any, index: number) => ({

                    ...submission,

                    competitionTitle:
                        finishedSubmissions[index]?.competition &&
                        typeof finishedSubmissions[index].competition === "object"
                            ? finishedSubmissions[index].competition.title
                            : null
                })
            );

        // ---------- GET USER COMPETITIONS ----------
        const competitions = await Competition.find({
            owner: user._id
        })
        .populate("owner", "username")
        .populate("logoBanner");

        // ---------- FORMAT COMPETITIONS ----------
        const formattedCompetitions =
            await Promise.all(

                competitions.map(
                    async (competition: any) => {

                        let signedLogoUrl = "";

                        if (
                            competition.logoBanner &&
                            competition.logoBanner.getSignedUrl
                        ) {

                            signedLogoUrl =
                                await competition
                                    .logoBanner
                                    .getSignedUrl();
                        }

                        return {
                            _id: competition._id,
                            title: competition.title,
                            description:
                                competition.description,
                            themes: competition.themes,
                            votingStartDate:
                                competition.votingStartDate,
                            endDate:
                                competition.endDate,
                            submissions:
                                competition.submissions,
                            owner:
                                competition.owner,

                            logoBanner:
                                competition.logoBanner,

                            signedLogoUrl
                        };
                    }
                )
            );

        // ---------- GET STATS ----------
        const stats = await calculateUserStats(
            user._id.toString()
        );

        // ---------- RESPONSE ----------
        return res.status(200).json({

            user: {
                _id: user._id,
                username: user.username,
                profilePicture,
                camera: user.camera,
                themes: user.themes,
            },

            submissions: enrichedSubmissions,

            competitions: formattedCompetitions,

            stats
        });

    } catch (err) {

        console.log(
            "GET PUBLIC PROFILE ERROR:",
            err
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
}

// ---------- USER STATS ----------
// --------------------------------
export async function getUserStats(req: Request, res: Response) {

    const userId = (req as any).user.id;

    try {

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "User not found",
                status: 404
            });
        }

        const stats = await calculateUserStats(userId);

        return res.status(200).json(stats);

    } catch (err) {

        return res.status(500).json({
            message: "Server error",
            err
        });
    }
}
