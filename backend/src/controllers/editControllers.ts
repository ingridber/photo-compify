import { Request, Response } from "express";
import { User } from "../models/User";
import z from "zod";

const editProfileDetailsSchema = z.object({
    camera: z.string().optional(),
    themes: z.array(z.string()).optional()
})

export async function editProfileDetails(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const validation = editProfileDetailsSchema.safeParse(req.body);

    if(!validation.success) {
        const message = validation.error.issues?.[0]?.message ?? "Validation failed";
        return res.status(400).json({message});
    }
    
    const { camera, themes } = validation.data;

    try {
        // ---------- BUILD UPDATE OBJECT ----------
        const updates: any = {};

        // Add camera if provided
        if (camera !== undefined) {
            updates.camera = camera;
        }

        // Add themes if provided
        if (themes !== undefined) {
            updates.themes = themes;
        }

        // ---------- UPDATE USER ----------
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: updates
            },
            {
                new: true
            }
        );

        // ---------- USER NOT FOUND ----------
        if (!user) {

            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "User not found",
                status: 404
            });
        }

        // ---------- SUCCESS ----------
        return res.status(200).json({
            code: "PROFILE_UPDATED",
            message:"Profile details updated successfully",
            user
        });

    } catch (err) {
        console.log(
            "EDIT PROFILE DETAILS ERROR:",
            err
        );

        return res.status(500).json({
            code: "SERVER_ERROR",
            message: "Server error"
        });
    }
}