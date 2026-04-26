import { useEffect, useState } from "react";
import { fetchCompetitions } from "../../services/api";
import CompetitionsCard from "./CompetitionsCard";

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

export default function CompetitionsPage() {
  // State for active competitions
  const [activeCompetitions, setActiveCompetitions] = useState<Competition[]>(
    [],
  );

  // State for historical competitions
  const [historicalCompetitions, setHistoricalCompetitions] = useState<
    Competition[]
  >([]);

  // State that controls which view is shown in the UI (active or historical)
  const [view, setView] = useState<"active" | "historical">("active");

  useEffect(() => {
    async function load() {
      try {
        // Fetch all competitions from the API
        // // Current time is used to determine status
        const competitions = await fetchCompetitions();
        const now = Date.now();

        // Filter out active competitions
        const active = competitions.filter(
          (c) => new Date(c.endDate).getTime() >= now,
        );

        // Filter out historical competitions
        const historical = competitions.filter(
          (c) => new Date(c.endDate).getTime() < now,
        );

        // Save to state
        setActiveCompetitions(active);
        setHistoricalCompetitions(historical);
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, []);

  // Decide which list to display depending on selected view
  const competitionsToShow =
    view === "active" ? activeCompetitions : historicalCompetitions;

  return (
    <div>
      <h1>Competitions</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setView("active")}>Active Competitions</button>
        <button onClick={() => setView("historical")}>
          Historical Competitions
        </button>
      </div>

      {/* Render the list of competitions as cards */}
      {competitionsToShow.map((comp) => (
        <CompetitionsCard key={comp.id} competition={comp} />
      ))}
    </div>
  );
}
