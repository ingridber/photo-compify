import { Schema, model } from "mongoose";
import { NotificationInterface } from "../types";

const NotificationInterfaceSchema = new Schema<NotificationInterface>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    competition: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    phase: { type: String, default: "submission" },
    read: { type: Boolean, default: false }
}, { timestamps: true });

NotificationInterfaceSchema.index(
    { createdAt: 1 }, 
    { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

export const Notification = model<NotificationInterface>("Notification", NotificationInterfaceSchema);