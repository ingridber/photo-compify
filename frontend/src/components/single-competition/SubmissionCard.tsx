import type { Indicator, Submission } from "../../types/competitions";
import styles from "./SubmissionCard.module.css";

interface SubmissionCardProps {
  submission: Submission;
  indicator: Indicator;
}

const INDICATOR_CLASS: Record<Exclude<Indicator, "none">, string> = {
  voted: styles.voted,
  gold: styles.gold,
  silver: styles.silver,
  bronze: styles.bronze,
};

export default function SubmissionCard({
  submission,
  indicator,
}: SubmissionCardProps) {
  return (
    <div className={styles.card}>
      {submission.signedImageUrl ? (
        <img
          className={styles.image}
          src={submission.signedImageUrl}
          alt={submission.description ?? "Submission"}
        />
      ) : (
        <div className={styles.placeholder} />
      )}

      {indicator !== "none" && (
        <span
          className={`${styles.dot} ${INDICATOR_CLASS[indicator]}`}
        />
      )}
    </div>
  );
}
