import { Request, Response } from "express";
import mongoose from "mongoose";
import { Notification } from "../models/Notification";
import { z } from "zod";
import { AuthRequest } from "../types";

const mongoIdSchema = z.object({
    id: z.string().length(24, { message: "Invalid Notification ID format" })
});

export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized." });
            return;
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const notifications = await Notification.find({ user: objectId }).sort({ createdAt: -1 });
        
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const validation = mongoIdSchema.safeParse(req.params);
        if (!validation.success) {
            res.status(400).json({ message: "Validation failed", errors: validation.error.errors });
            return;
        }

        const notificationId = validation.data.id;
        const userId = req.user?.id;

        const updatedNotification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: new mongoose.Types.ObjectId(userId) },
            { $set: { read: true } },
            { returnDocument: 'after' }
        );

        if (!updatedNotification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }

        res.status(200).json(updatedNotification);
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ message: "Server error" });
    }
};