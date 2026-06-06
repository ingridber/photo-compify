import type { Submission, Indicator } from "../types/competitions";


export function getIndicator(
    submission: Submission,
    phase: "submission" | "voting" | "ended",
    rank: number,
    userId: string | undefined,
): Indicator {

if (!submission) return "none";

    if (phase === "voting" && userId) {

        return submission.votes?.includes(userId)
            ? "voted"
            : "none";
    }

    if (phase === "ended") {

        if (rank === 0) return "gold";
        if (rank === 1) return "silver";
        if (rank === 2) return "bronze";
    }

    return "none";
}

export function sortSubmissions(
    submissions: Submission[],
    phase: "submission" | "voting" | "ended",
    userId?: string,
): Submission[] {
    if (phase === "submission" && userId) return [...submissions].filter(s => s.user?._id === userId);
    if (phase === "voting" && userId) {
        return [...submissions].sort(
            (a, b) =>
                (b.votes?.includes(userId) ? 1 : 0) -
                (a.votes?.includes(userId) ? 1 : 0),
        );
    }

    if (phase === "ended") {
        return [...submissions].sort(
            (a, b) => (b.votes.length ?? 0) - (a.votes.length ?? 0),
        );
    }

    return submissions;
}

export function getSubmissionIndicator(submission: Submission) {

    if (typeof submission.competition === "string") {
        return "none";
    }

    const sorted = [...submission.competition.submissions].sort(
        (a, b) =>
            (b.votes?.length ?? 0) -
            (a.votes?.length ?? 0)
    );

    const rank = sorted.findIndex(
        (s) => s._id === submission._id
    );

    return getIndicator(
        submission,
        submission.competition.phase,
        rank,
        undefined
    );
}