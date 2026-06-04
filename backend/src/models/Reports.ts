import { Schema, model } from "mongoose";
import { ReportInterface } from "../types/index";


const reportSchema = new Schema<ReportInterface>(
    
    {
        reportId: {
            type: String,
            required: true,
            unique: true,
        },

        reportedUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        submissionId: {
            type: Schema.Types.ObjectId,
            ref: "Submission",
            required: true,
        },

        competitionId: {
            type: Schema.Types.ObjectId,
            ref: "Competition",
            required: true,
        },

        name: {
            type: String,
            default: "Not provided",
        },

        email: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            maxlength: 250,
        },

        evidenceImg: {
            type: Schema.Types.ObjectId,
            ref: "Image",
            default: null,
        },
    },
        {
            timestamps: true,
        }
);

export const Report = model<ReportInterface>("Report", reportSchema);
