import { Competition } from "../models/Competition";
import {Submission} from "../models/Submission";
import type { CompetitionSubmissionInterface } from "../types";


export async function calculateUserStats(userId: string) {

    // ---------- GET FINISHED COMPETITIONS ----------
    const competitions = await Competition.find({
        endDate: { $lt: new Date() }
    }).populate({
        path: "submissions",
        populate: {
            path: "user"
        }
    });

    // ---------- COUNT WINS ----------
    let wins = 0;

    for (const competition of competitions) {

        const submissions =[
            ...competition.submissions
        ] as CompetitionSubmissionInterface[];

        if (submissions.length === 0) continue;

        submissions.sort(
            (a: any, b: any) =>
                (b.votes?.length ?? 0) -
                (a.votes?.length ?? 0)
        );

        const winner = submissions[0];

        if (!winner) continue;

        const winnerId =
            typeof winner.user === "string"
                ? winner.user
                : winner.user._id.toString();

        if (winnerId === userId.toString()) {
            wins++;
        }
    }

    // ---------- COUNT SUBMISSIONS ----------
    const submissions = await Submission.countDocuments({
        user: userId
    });

    // ---------- COUNT CREATED COMPETITIONS ----------
    const competitionsCreated =
        await Competition.countDocuments({
            owner: userId
        });

    return {
        wins,
        submissions,
        competitionsCreated
    };
}