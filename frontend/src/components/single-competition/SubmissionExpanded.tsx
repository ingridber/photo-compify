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
        <>
        <button
                className={styles.voteButton}
                type="button"
                onClick={handleVote}
            >
                {hasVoted ? "Remove vote" : "Vote"}
        </button>
        </>
        
    //      <> 

    //     <div className={styles.fullscreenModal}>



    //         <div className={styles.fullscreenContent}>


                

            
    //             <img

    //                 className={styles.fullscreenImage}
    //                 src={submission.signedImageUrl}
    //                 alt={submission.description ?? "Submission"}
    //                 onClick={onClose}
    //             />

    //             <button className={styles.closeFullscreenBtn} type="button" onClick={onClose}>
    //                 Close
    //             </button>

    //             {phase === "voting" && (
    //                 <button
    //                     className={styles.voteButton}
    //                     type="button"
    //                     onClick={handleVote}
    //                 >
    //                     {hasVoted ? "Remove vote" : "Vote"}
    //                 </button>
    //             )}

    //             {phase === "finished" && (
    //                 <div className={styles.details}>
    //                     <span className={styles.username}>
    //                         {submission.user.username}
    //                     </span>
    //                     <span className={styles.voteCount}>
    //                         {submission.votes.length} votes
    //                     </span>
    //                 </div>
    //             )}
    //         </div>
    //     </div>


    // </>

    );
}
