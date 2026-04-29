import { Schema, model } from "mongoose";
import { CompetitionSubmissionInterface } from "../types";

const submissionSchema = new Schema<CompetitionSubmissionInterface>({
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    image: {type: Schema.Types.ObjectId, reg: "Image", required: true},
    description: {type: String},
    votes: [{type: Schema.Types.ObjectId, ref: "User"}]
}, {timestamps: true})

export const Submission = model<CompetitionSubmissionInterface>("Submission", submissionSchema);
