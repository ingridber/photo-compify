import { Schema, model } from "mongoose";
import { InterfaceUser } from "../types/index";

const userSchema = new Schema<InterfaceUser>({
    name: { type: String, required: false, maxlength: 80 },
    username: { type: String, required: true, unique: true, lowercase: true, minlength: 3, maxlength: 80 },
    email: { type: String, required: false, lowercase: true, maxlength: 80 },
    password: { type: String, required: true, minlength: 8, maxlength: 128 },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user", required: true },
    profilePicture: { type: Schema.Types.ObjectId, ref: "Image", default: null},
    warnings: { type: Number, default: 0 },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    camera: {type: String},
    themes: [{type: String}],
});

export const User = model<InterfaceUser>("User", userSchema);