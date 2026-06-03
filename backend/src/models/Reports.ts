import { Schema, model } from "mongoose";
import { ReportInterface } from "../types/index";


const reportSchema = new Schema<ReportInterface>({
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

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
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

        evidenceImageId: {
            type: Schema.Types.ObjectId,
            ref: "Image",
            default: null,
        },
    },

});

export const User = model<ReportInterface>("Report", reportSchema);
