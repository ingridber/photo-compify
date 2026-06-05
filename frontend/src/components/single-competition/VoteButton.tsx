import type { Submission } from "../../types/competitions";
import { voteOnSubmission, removeVote } from "../../services/api";
import styles from "./vote-button.module.css";
import { useState } from "react";

interface VoteButtonProps {
    submission: Submission;
    phase: "submission" | "voting" | "ended";
    userId?: string;
    onClose: () => void;
    onVoteChange: ( submissionId: string, voted: boolean) => void;
    variant?: "card" | "fullscreen"
}

export default function VoteButton({
    submission,
    userId,
    onVoteChange,
    variant = "card",
}: VoteButtonProps) {
    const hasVoted = userId ? submission.votes.includes(userId) : false;
    const [voteError, setVoteError] = useState("");

async function handleVote() {
    try {
        if (hasVoted) {
            await removeVote(submission._id);
            onVoteChange(submission._id, false)
        } else {
            await voteOnSubmission(submission._id);
            onVoteChange(submission._id, true)
        }

    } catch (err: unknown) {
        const message =
            err instanceof Error
                ? err.message
                : "Vote failed";

        setVoteError(message);

        setTimeout(() => {
            setVoteError("");
        }, 3000);
    }
}
    
    return (
    <>
        <button
            className={
                variant === "fullscreen"
                    ? styles.voteButtonFullscreen
                    : styles.voteButton
            }
            type="button"
            onClick={handleVote}
        >
            {hasVoted ? "Remove vote" : "Vote"}
        </button>

        {voteError && (
            <div className={styles.voteError}>
                {voteError}
            </div>
        )}
    </>
    );
}
