import type { Submission, Phase} from "../../types/competitions";
import { voteOnSubmission, removeVote } from "../../services/api";
import styles from "./SubmissionExpanded.module.css";

interface SubmissionExpandedProps {
    submission: Submission;
    phase: Phase;
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
        <div className={styles.overlay}>
            <div className={styles.content}>
                <button className={styles.close} type="button" onClick={onClose}>
                    ×
                </button>

            
                <img
                    className={styles.image}
                    src={submission.signedImageUrl}
                    alt={submission.description ?? "Submission"}
                    onClick={onClose}
                />

                {phase === "voting" && (
                    <button
                        className={styles.voteButton}
                        type="button"
                        onClick={handleVote}
                    >
                        {hasVoted ? "Remove vote" : "Vote"}
                    </button>
                )}

                {phase === "finished" && (
                    <div className={styles.details}>
                        <span className={styles.username}>
                            {submission.user.username}
                        </span>
                        <span className={styles.voteCount}>
                            {submission.votes.length} votes
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
