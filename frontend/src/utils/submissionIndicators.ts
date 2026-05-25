import type { Submission, Indicator, Phase } from "../types/competitions";


export function getIndicator(
    submission: Submission,
    phase: Phase,
    rank: number,
    userId: string | undefined,
): Indicator {

if (!submission) return "none";

    if (phase === "voting" && userId) {

        return submission.votes?.includes(userId)
            ? "voted"
            : "none";
    }

    if (phase === "finished") {

        if (rank === 0) return "gold";
        if (rank === 1) return "silver";
        if (rank === 2) return "bronze";
    }

    return "none";
}

export function sortSubmissions(
    submissions: Submission[],
    phase: Phase,
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

    if (phase === "finished") {
        return [...submissions].sort(
            (a, b) => (b.votes.length ?? 0) - (a.votes.length ?? 0),
        );
    }

    return submissions;
}