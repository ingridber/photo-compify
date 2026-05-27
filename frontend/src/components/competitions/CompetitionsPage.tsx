import styles from "./competitions-page.module.css";
import mixins from "../../styles/mixins.module.css";
import { useEffect, useState, useRef } from "react";
import { fetchCompetitions } from "../../services/api";
import CompetitionsCard from "./CompetitionsCard";
import Pagination from "./Pagination";
import { useSearchParams } from "react-router";
import AVAILABLE_THEMES from "../../constants/availableThemes";

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

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]); // Stores fetched competitions
  const inputRef = useRef<HTMLInputElement>(null); // Ref for focusing search input field
  const [page, setPage] = useState(1); // Current pagination page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]); // Stores selected theme filters
  const [view, setView] = useState<"submission" | "voting" | "ended">("submission"); // Current competition status view filter
  const [searchParams] = useSearchParams(); // Reads URL search parameters
  const [search, setSearch] = useState(searchParams.get("search") || ""); // Search input state
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { // Fetch competitions whenever dependencies change
    async function load() {
      try {
        const result = await fetchCompetitions({
          page,
          limit: 5,
          status: view,
          search,
          themes: selectedThemes,
        });

        setCompetitions(result.competitions); // Store fetched competitions
        setTotalPages(result.pagination.totalPages); // Store pagination info
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, [page, view, search, selectedThemes]); // Re-run when page, view, or search changes

  useEffect(() => { // Auto-focus search input when search is opened
    if (showFilters) {
      inputRef.current?.focus();
    }
  }, [showFilters]);

  const toggleTheme = (theme: string) => { // Toggle theme selection in filter
    setSelectedThemes((prev) =>
      prev.includes(theme)
        ? prev.filter((t) => t !== theme) // Remove theme if already selected
        : [...prev, theme] // Add theme if not selected
    );
    setPage(1); // Reset to first page when filter changes
  };

  

  return (
    <div className={`${styles.competitionsPage} ${mixins.main}`}>
      <h1>Competitions</h1>

      {/* BUTTON CONTAINER */}
      <div className={styles.buttonContainer}>
        <button
          className={view === "submission" ? styles.active : ""}
          onClick={() => {
            setView("submission");
            setPage(1);
          }}
        >
          Submission
        </button>

        <button
          className={view === "voting" ? styles.active : ""}
          onClick={() => {
            setView("voting");
            setPage(1);
          }}
        >
          Voting
        </button>

        <button
          className={view === "ended" ? styles.active : ""}
          onClick={() => {
            setView("ended");
            setPage(1);
          }}
        >
          Ended
        </button>

        <button
          className={showFilters ? styles.active : ""}
          onClick={() => {
            setShowFilters((prev) => !prev);
          }}
        >
          Search
        </button>
      </div>

      {/* THEME DROPDOWN */}
      {showFilters && (
        <div className={styles.filterContainer}>
          <div className={styles.themeList}>
            {AVAILABLE_THEMES.map((theme) => {
              const isSelected = selectedThemes.includes(theme); // Check if theme is selected

              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => toggleTheme(theme)}
                  className={`${styles.themeChip} ${
                    isSelected ? styles.themeChipActive : ""
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH INPUT */}
      {showFilters && (
        <div className={styles.searchFieldContainer}>
          <div
            className={`${mixins.inputFieldContainer} ${styles.inputFieldContainer}`}
          >
            <input
              ref={inputRef}
              className={mixins.inputField}
              type="text"
              placeholder="Search competition title or username"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <button
              className={styles.clearInput}
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      {competitions.length === 0 ? (
        <p className={styles.noContent}>No competitions found</p>
      ) : (
        competitions.map((comp) => (
          <CompetitionsCard key={comp._id} competition={comp} />
        ))
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}