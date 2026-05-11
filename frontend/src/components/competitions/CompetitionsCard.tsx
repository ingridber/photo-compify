import styles from "./competitions-card.module.css"
import { useNavigate } from "react-router";

// Definition of types from API
type Competition = {
  _id: string;
  owner: {
    _id: string;
    username: string;
  };
  title: string;
  logoBanner?: string;
  description: string;
  themes: string[];
  startDate: string;
  votingStartDate: string;
  endDate: string;
  submissions: string[];
  totalVoteCount: number;
  participantCount: number;
};

// Props for component
type Props = {
  competition: Competition;
};

// Function for what phase the competition is in "submission" | "voting" | "ended"
function getCompetitionPhase(
  comp: Competition,
): "submission" | "voting" | "ended" {
  const now = new Date();
  const votingStart = new Date(comp.votingStartDate);
  const end = new Date(comp.endDate);

  // If competition already has ended
  if (now >= end) return "ended";

  // If voting has started but not closed
  if (now >= votingStart) return "voting";

  return "submission";
}

export default function CompetitionsCard({ competition }: Props) {
  const phase = getCompetitionPhase(competition);
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/competitions/${competition._id}`);
  }

  return (
    // ----- CARD CONTAINER -----
    <div onClick={() => handleClick()}
        className={styles.cardContainer}>

      {/* ----- CARD HEADER: Logo & Themes----- */}
      <div className={styles.cardHeader}>

        {/* LOGO */}
        <div className={styles.logoContainer}
            style={{
              borderColor: phase === "ended" ? "red" : phase === "submission" ? "green" : "yellow"}}>
          {competition.logoBanner ? (
            // LOGO PIC
            <img
              src={competition.logoBanner}
              alt={`${competition.title} logo`}
              className={styles.logoPic}/>
          ) : (
            // NO LOGO TEXT
            <img
              src="/competitions.svg"
              alt={`Competition icon`}
              className={styles.noLogo}/>
          )}
        </div>
        <div className={styles.themesContainer}>
        {/* THEMES CONTAINER  */}
          {(competition.themes ?? []).map((theme) => (
            // THEME 
            <span className={styles.theme}
              key={theme}>
                {theme}
            </span>
          ))}
        </div>
      </div>


      {/* ----- CARD MAIN: Title & description ----- */}
      <div className={styles.cardMain}>
        
        {/* TITLE & DESSCRIPTION */}
        <div className={styles.titleDescriptionContainer}>
          {/* COMPETITION TITLE  */}
          <h2 className={styles.title}>{competition.title}</h2>
          {/* COMPETITION DESCRIPTION  */}
          <p className={styles.description}>{competition.description}</p>
        </div>
      </div>

      {/* ----- CARD FOOTER: Status, End, Creator, Participants ----- */}
        <div className={styles.cardFooter}>
          <div>
            <p className={styles.specsTitle}>Status</p>
            <p className={styles.phase}
            style={{
            color: phase === "ended" ? "red" : phase === "submission" ? "green" : "yellow"}}>
            {phase}
            </p>
          </div>
          <div className={styles.hideEnd}>
            <p className={styles.specsTitle}>Ends on</p>
            <p className={styles.endDate}>{new Date(competition.endDate).toLocaleDateString()}</p>
          </div>
          <div className={styles.hideOwner}>
            <p className={styles.specsTitle}>Created by</p>
            <p className={styles.owner}>{competition.owner?.username}</p>
          </div>
          <div>
            <p className={styles.specsTitle}>Participants</p>
            <p className={styles.participants}>{competition.submissions.length}</p>
          </div>
        </div>
      </div>
  );
}
