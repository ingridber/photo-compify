import type { Submission } from "../../types/competitions";
import { voteOnSubmission, removeVote } from "../../services/api";
import styles from "./SubmissionExpanded.module.css";

interface SubmissionExpandedProps {
    submission: Submission;
    phase: "submission" | "voting" | "ended";
    userId?: string;
    onClose: () => void;
    onVoteChange: () => void;
}

export default function SubmissionExpanded({
    submission,
    phase,
    userId,
    onClose,
    onVoteChange,
}: SubmissionExpandedProps) {
    const hasVoted = userId ? submission.votes.includes(userId) : false;

    async function handleVote() {
        try {
            if (hasVoted) {
                await removeVote(submission._id);
            } else {
                await voteOnSubmission(submission._id);
            }
            onVoteChange();
        } catch (err) {
            console.error("Vote failed:", err);
        }
    }

    return (
        <>
        <button
                className={styles.voteButton}
                type="button"
                onClick={handleVote}
            >
                {hasVoted ? "Remove vote" : "Vote"}
        </button>
        </>

    );
}
