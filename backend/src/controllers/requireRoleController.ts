import { Request, Response } from "express";
import { User } from "../models/User";
import { Image } from "../models/Image";
import { Submission } from "../models/Submission";
import { Competition } from "../models/Competition";
import { supabase } from "../config/supabase";

export async function deleteUserById(
    req: Request,
    res: Response
) {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // ---------- PROFILE IMAGE ----------
        const profileImage = await Image.findById(user.profilePicture);

        if (profileImage) {
            await supabase.storage
                .from("images")
                .remove([profileImage.filename]);

            await Image.findByIdAndDelete(profileImage._id);
        }

        // ---------- USER SUBMISSIONS ----------
        const submissions = await Submission.find({ user: user._id });

        const submissionIds = submissions.map(s => s._id);
        const submissionImageIds = submissions
            .filter(s => s.image)
            .map(s => s.image._id);

        const submissionImages = await Image.find({
            _id: { $in: submissionImageIds }
        });

        const filenames = submissionImages.map(img => img.filename);

        if (filenames.length > 0) {
            const { error } = await supabase.storage
                .from("images")
                .remove(filenames);

            if (error) {
                throw new Error("Supabase deletion failed");
            }
        }

        await Image.deleteMany({
            _id: { $in: submissionImageIds }
        });

        // ---------- REMOVE SUBMISSIONS FROM COMPETITIONS ----------
        await Competition.updateMany(
            { submissions: { $in: submissionIds } },
            {
                $pull: {
                    submissions: { $in: submissionIds }
                }
            }
        );

        // ---------- REMOVE USER VOTES ----------
        await Submission.updateMany(
            { votes: user._id },
            {
                $pull: {
                    votes: user._id
                }
            }
        );

        // ---------- DELETE USER SUBMISSIONS ----------
        await Submission.deleteMany({
            user: user._id
        });

        // ---------- HANDLE OWNED COMPETITIONS ----------
        await Competition.updateMany(
            { owner: user._id },
            {
                $set: {
                    owner: null
                }
            }
        );

        // ---------- DELETE USER ----------
        await User.findByIdAndDelete(id);

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "Server error"
        });
    }
}
