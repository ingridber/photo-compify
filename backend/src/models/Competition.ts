import { Schema, model } from "mongoose";
import { CompetitionInterface } from "../types";

const competitionSchema = new Schema<CompetitionInterface>({
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 50 },
    logoBanner: { type: String },
    description: { type: String, required: true, maxlength: 250 },
    themes: { type: [String], required: true },
    startDate: { type: Date },
    votingStartDate: { type: Date },
    endDate: { type: Date },
    submissions: [{ type: Schema.Types.ObjectId, ref: "Submissions" }],
    totalVoteCount: { type: Number, default: 0 },
}, { timestamps: true }
);

competitionSchema.pre("save", function() {
    if (this.isNew) {
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const start = this.startDate ?? new Date();
        if (!this.startDate) this.startDate = start;
        if (!this.votingStartDate) this.votingStartDate = new Date(start.getTime() + 5 * MS_PER_DAY);
        if (!this.endDate) this.endDate = new Date(start.getTime() + 5 * MS_PER_DAY);
    }
});


export const Competition = model<CompetitionInterface>("Competition", competitionSchema);
