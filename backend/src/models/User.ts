import { Schema, model } from "mongoose";
import { InterfaceUser } from "../types/index";

const userSchema = new Schema<InterfaceUser>({
    username: { type: String, required: true, unique: true, lowercase: true, minlength: 3, maxlength: 80 },
    password: { type: String, required: true, minlength: 8, maxlength: 128 },
    loginAttempts: {type: Number, default: 0},
    lockUntil: {type: Date},
});

export const User = model<InterfaceUser>("User", userSchema);
