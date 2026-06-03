import styles from "./competitions-card.module.css";
import { useNavigate } from "react-router";
import type { Competition } from "../../types/competitions";

// Props for component
type Props = {
  competition: Competition;
};

export default function CompetitionsCard({ competition }: Props) {
  const phase = competition.phase;
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/competitions/${competition._id}`);
  }

  return (
  <div onClick={() => handleClick()} className={styles.cardContainer}>

    {/* CARD HEADER ----- background image, phase, competition title */}
    <div 
      className={`${styles.cardHeader} ${competition.signedLogoUrl ? styles.cardLogo : styles.cardNoLogo}`}
      style={competition.signedLogoUrl
        ? {
          backgroundImage: `
            linear-gradient(
              to top,
              rgba(0,0,0,0.82),
              rgba(0,0,0,0.45),
              rgba(0,0,0,0.18)
            ),
            url(${competition.signedLogoUrl})
          `,
          color: 'var(--text-light)',}
        : undefined}
    >

      <div
        className={styles.phasePill}
        style={{backgroundColor:
          phase === "voting"
          ? "rgba(0, 128, 0, 0.5)"
          : phase === "submission"
          ? "rgba(0, 0, 255, 0.5)"
          : "rgba(255, 0, 0, 0.5)",
        }}>
          {phase}
      </div>

      <div className={styles.heroContent}>
        <p className={styles.heroEyebrow}>Photography Competition</p>
        <h2 className={styles.heroTitle}>{competition.title}</h2>
      </div>  
    </div>

    {/* CARD MAIN ----- themes, description */}
    <div className={styles.cardMain}>
      <div className={styles.themesContainer}>
          {(competition.themes ?? []).map((theme) => {

            const safeTheme = theme ?? "Default";
            const themeClass =`${safeTheme.replace(/\s+/g, "").replace(/&/g, "")}Color`;

            return (
              <span key={safeTheme} className={`${styles.theme} ${themeClass}`}>
                {safeTheme}
              </span>
            );
          })}
      </div>

      <p className={styles.description}>{competition.description}</p>
    </div>
    
    {/* CARD FOOTER ----- Owner, Participants, End Date ----- */}
    <div className={styles.cardFooter}>
      <div className={styles.hideOwner}>
        <p className={styles.specsTitle}>Hosted by</p>
        <p className={styles.owner}>{competition.owner?.username}</p>
      </div>  
      <div>
        <p className={styles.specsTitle}>Participants</p>
        <p className={styles.participants}>{competition.submissions.length}</p>
      </div>
      <div className={styles.hideEnd}>
        <p className={`${styles.specsTitle} ${styles.endsOn}`}>{phase === "ended" ? 'Ended on' : 'Ends on'}</p>
        <p className={styles.endDate}>{new Date(competition.endDate).toLocaleDateString()}</p>
      </div>
    </div>
  </div>
  );
}
