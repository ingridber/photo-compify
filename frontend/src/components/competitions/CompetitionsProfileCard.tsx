import styles from "./competitions-profile-card.module.css";
import { useNavigate } from "react-router";
import type { Competition } from "../../types/competitions";

type Props = {
  competition: Competition;
};

export default function CompetitionsProfileCard({competition}: Props) {
  const phase = competition.phase;
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/competitions/${competition._id}`);
  }

  return (
  <div className={styles.competitionCell} onClick={handleClick}>

    {/* ----- background ----- */}
    <div
      className={`${styles.card} ${competition.signedLogoUrl
          ? styles.cardLogo
          : styles.cardNoLogo}`}
      style={competition.signedLogoUrl
          ? ({["--card-bg"]: `
                linear-gradient(
                  to top,
                  rgba(0,0,0,0.82),
                  rgba(0,0,0,0.45),
                  rgba(0,0,0,0.18)
                ),
                url(${competition.signedLogoUrl})`,} as React.CSSProperties)
          : undefined}
    >
      {/* ----- phase ----- */}
      <div className={styles.phasePill} 
        style={{
          backgroundColor:
            phase === "voting"
              ? "rgba(0, 128, 0, 0.7)"
              : phase === "submission"
              ? "rgba(0, 0, 255, 0.7)"
              : "rgba(255, 0, 0, 0.7)",}}
      >
        {phase}
      </div>

      {/* ----- competition title ----- */}
      <div className={styles.titleContainer}>
        <p className={styles.heroEyebrow}>
          Photography Competition
        </p>
        <h2 className={styles.heroTitle}>
          {competition.title}
        </h2>
      </div>

      {/* TKR TYP DET HÄR ÄR FULT? TA BORT?  */}
      {/* ----- competition title ----- */}
      <div className={styles.competitionFooter}>
        <div className={styles.themesContainer}>
          {(competition.themes ?? []).map((theme) => {
            const safeTheme = theme ?? "Default";
            const themeClass = `${safeTheme.replace(/\s+/g, "").replace(/&/g, "")}Color`;

            return (
              <span key={safeTheme} className={`${styles.theme} ${themeClass}`}>
                {safeTheme}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  </div>
  );
}
