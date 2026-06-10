import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router";
import Select from "react-select";
import type { MultiValue } from "react-select";
import styles from "./competitions-page.module.css";
import { fetchCompetitions } from "../../services/api";
import CompetitionsCard from "./CompetitionsCard";
import Pagination from "./Pagination";
import AVAILABLE_THEMES from "../../constants/availableThemes";
import type { Competition, ThemeOption } from "../../types/competitions"

const AVAILABLE_THEMES_OBJ: ThemeOption[] = AVAILABLE_THEMES.map((theme) => ({value: theme,label: theme,}));

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [view, setView] = useState<"submission" | "voting" | "ended">("submission");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCompetitions({
            page,
            limit: 5,
            status: view,
            search,
            themes: selectedThemes,
          });

        setCompetitions(result.competitions);
        setTotalPages(result.pagination.totalPages);
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, [page, view, search, selectedThemes]);

  const handleSelectThemes = (selected: MultiValue<ThemeOption>) => {
    setSelectedThemes(selected.map((theme) => theme.value));
    setPage(1);
  };

  return (
    <div className={styles.competitionsPage}>
      {/* title */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>All Competitions</h1>
        <p className={styles.pageDescription}>Discover and join photography competitions</p>
      </div>

      {/* select views */}
      <div className={styles.optionsRow}>
        <div
          className={`${styles.optionCell} ${styles.optionClickable} ${view === "submission" ? styles.activeOption : ""}`}
          onClick={() => {setView("submission"); setPage(1);}}
        >
          <span className={styles.small}>Open for</span>
          <span className={styles.large}>Submission</span>
        </div>
        <div
          className={`${styles.optionCell} ${styles.optionClickable} ${view === "voting" ? styles.activeOption : ""}`}
          onClick={() => {setView("voting"); setPage(1);}}
        >
          <span className={styles.small}>Start</span>
          <span className={styles.large}>Voting</span>
        </div>
        <div
          className={`${styles.optionCell} ${styles.optionClickable} ${view === "ended" ? styles.activeOption : ""}`}
          onClick={() => {setView("ended"); setPage(1);}}
        >
          <span className={styles.small}>Explore</span>
          <span className={styles.large}>Ended</span>
        </div>
        <div
          className={`${styles.optionCell} ${styles.optionClickable} ${showFilters ? styles.activeOption : ""}`}
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <span className={styles.small}>Search &</span>
          <span className={styles.large}>Filter</span>
        </div>
      </div>

      {/* filter */}
      {showFilters && (
        <div className={styles.filterPanel}>

          {/* search  */}
          <div className={styles.searchContainer}>
            <label className={styles.label}>Search</label>

            <div className={styles.inputWrapper}>
                <input
                    ref={inputRef}
                    className={styles.input}
                    type="text"
                    placeholder="Competition title or username"
                    value={search}
                    onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                />
                {search && (
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={() => {setSearch(""); setPage(1); inputRef.current?.focus();}}
                    >
                        ✕
                    </button>
                )}
            </div>
          </div>

          {/* themes */}
          <div className={styles.themeContainer}>
            <label className={styles.label}>Themes</label>
            <div className={styles.selectWrapper}>
              <Select
                classNamePrefix="cinema-select"
                options={AVAILABLE_THEMES_OBJ}
                value={AVAILABLE_THEMES_OBJ.filter(
                  (theme) =>
                    selectedThemes.includes(theme.value)
                )}
                onChange={handleSelectThemes}
                isMulti
                placeholder="Select themes..."
                closeMenuOnSelect={false}
                styles={{
                  option: (base) => ({
                      ...base,
                      color: "black"
                  }),}}
              />
            </div>
          </div>

          <button
            onClick={() => {setShowFilters(!showFilters); setSearch(""); setSelectedThemes([]);}}
            className={styles.closeBtn}
            aria-label="Close filters"
          >
            Close
          </button>
        </div>
      )}

      {competitions.length === 0 ? (
        <p className={styles.noContent}>
          No competitions found
        </p>
      ) : (
        <div className={styles.pageCardContainer}>
          {competitions.map((comp) => (
            <CompetitionsCard key={comp._id} competition={comp}/>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage}/>
    </div>
  );
}