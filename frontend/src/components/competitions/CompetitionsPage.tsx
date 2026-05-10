import styles from "./competitions-page.module.css";
import mixins from "../../styles/mixins.module.css";
import { useEffect, useState, useRef } from "react";
import { fetchCompetitions } from "../../services/api";
import CompetitionsCard from "./CompetitionsCard";
import Pagination from "./Pagination";

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
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [view, setView] = useState<"active" | "finished">("active");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCompetitions({
          page,
          limit: 5,
          status: view === "finished" ? "historical" : "active",
          search,
        });

        setCompetitions(result.competitions);
        setTotalPages(result.pagination.totalPages);
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, [page, view, search]);

  useEffect(() => {
    if (showSearch) {
      inputRef.current?.focus();
    }
  }, [showSearch]);

  return (
    <div className={styles.competitionsPage}>
      <h1>Competitions</h1>

      {/* BUTTON CONTAINER  */}
      <div className={styles.buttonContainer}>
        <button
          onClick={() => {
            setView("active");
            setPage(1);
            setShowSearch(false);
            setSearch("");
          }}
        >
          Active
        </button>

        <button
          onClick={() => {
            setView("finished");
            setPage(1);
            setShowSearch(false);
            setSearch("");
          }}
        >
          Finished
        </button>

        <button onClick={() => setShowSearch((prev) => !prev)}>Search</button>
      </div>

      {showSearch && (
        // SEARCH FIELD CONTAINER
        <div className={styles.searchFieldContainer}>
          <div
            className={`${mixins.inputFieldContainer} ${styles.inputFieldContainer} `}
          >
            {/* SEARCH FIELD  */}
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

            {/* CLEAR BUTTON  */}
            <button
              className={styles.clearInput}
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
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
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
