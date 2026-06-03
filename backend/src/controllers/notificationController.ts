import { Request, Response } from "express";
import { Notification } from "../models/Notification";
import { z } from "zod";

const mongoIdSchema = z.object({
    id: z.string().length(24, { message: "Invalid Notification ID format" })
});

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id; 

        if (!userId) {
            res.status(401).json({ message: "Unauthorized." });
            return;
        }

        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = mongoIdSchema.safeParse(req.params);

        if (!validation.success) {
            res.status(400).json({ 
                message: "Validation failed", 
                errors: validation.error.errors 
            });
            return;
        }

        const notificationId = validation.data.id;
        const userId = (req as any).user?.id;

        const updatedNotification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { $set: { read: true } },
            { new: true }
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