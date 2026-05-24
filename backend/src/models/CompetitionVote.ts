import { CompetitionVoteInterface } from "../types";
import { Schema, model } from "mongoose";

const CompetitionVoteSchema = new Schema<CompetitionVoteInterface>({
    competition: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    submissions: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
});

CompetitionVoteSchema.index({ user: 1, competition: 1 }, { unique: true });

export const CompetitionVote = model<CompetitionVoteInterface>("CompetitionVote", CompetitionVoteSchema);
