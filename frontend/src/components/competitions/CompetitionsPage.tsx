import { useEffect, useState, useRef } from "react";
import { fetchCompetitions } from "../../services/api";
import CompetitionsCard from "./CompetitionsCard";

// Definition of types from API
type Competition = {
  id: string;
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

  // Controls if search panel is visible
  const [showSearch, setShowSearch] = useState(false);

  // Search inputs
  const [search, setSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if(showSearch) {
      inputRef.current?.focus();
    }
  }, [showSearch]);

  // Decide which list to display depending on selected view
  const competitionsToShowBase =
    view === "active" ? activeCompetitions : historicalCompetitions;

  // Filtering for searching competition by title and username
  const competitionsToShow = competitionsToShowBase.filter((comp) => {
    const title = comp.title ?? "";
    const ownerUsername = comp.owner?.username ?? "";

    const searchLower = search.toLowerCase();

    return (
      title.toLowerCase().includes(searchLower) ||
      ownerUsername.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <h1>Competitions</h1>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          style={{ borderRadius: 10, height: "39px", width: "65px" }}
          onClick={() => {
            setView("active");
            setShowSearch(false);
            setSearch("");
          }}
        >
          Active
        </button>
        <button
          style={{ borderRadius: 10, height: "39px", width: "65px" }}
          onClick={() => {
            setView("historical");
            setShowSearch(false);
            setSearch("");
        }}
        >
          Finished
        </button>
        <button
          style={{ borderRadius: 10, height: "39px", width: "65px" }}
          onClick={() => setShowSearch((prev) => !prev)}
        >
          Search
        </button>
      </div>
      {showSearch && (
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            gap: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <input
             ref={inputRef}
              type="text"
              placeholder="Search competition title or username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "348px",
                height: "39px",
                borderRadius: "10px",
                padding: "0 10px",
              }}
            />
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "20px",
                width: "10px",
                height: "18px",
                top: "40%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                fontSize: "16px",
                cursor: "pointer",
                color: search ? "#fff" : "#666",
                opacity: 1
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Render the list of competitions as cards */}
      {competitionsToShow.length === 0 ? (
        <p>No competitions match your search.</p>
      ) : (
        competitionsToShow.map((comp) => (
          <CompetitionsCard key={comp.id} competition={comp} />
        ))
      )}
    </div>
  );
}
