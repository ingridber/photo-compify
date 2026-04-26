// Definition of types from API
type Competition = {
  id: string;
  owner: string;
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

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#ddd",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {competition.logoBanner ? (
            <img
              src={competition.logoBanner}
              alt={`${competition.title} logo`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ fontSize: 12 }}>No logo</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {competition.themes.map((theme) => (
            <span
              key={theme}
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                background: "#e5e5e5",
                fontSize: 12,
              }}
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ margin: 0 }}>{competition.title}</h2>

        <p style={{ margin: 0, color: "#555" }}>{competition.description}</p>

        <p>
          Status: <strong>{phase.toUpperCase()}</strong>
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          fontSize: 14,
          color: "#444",
        }}
      >
        <span>
          Ends on: {new Date(competition.endDate).toLocaleDateString()}
        </span>

        <span>Participants: {competition.participantCount}</span>
      </div>
    </div>
  );
}
