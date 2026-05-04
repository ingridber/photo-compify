import { useEffect, useState, useRef } from "react";
import { fetchCompetitions } from "../../services/api";
import CompetitionsCard from "./CompetitionsCard";
import Pagination from "./Pagination";

// Type definition for a competition object coming from the API
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

  // view stays the same ("active" | "finished")
  const [view, setView] = useState<"active" | "finished">("active");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCompetitions({
          page,
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
            setPage(1);
            setShowSearch(false);
            setSearch("");
          }}
        >
          Active
        </button>

        <button
          style={{ borderRadius: 10, height: "39px", width: "65px" }}
          onClick={() => {
            setView("finished");
            setPage(1);
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: "348px",
                height: "39px",
                borderRadius: "10px",
                padding: "0 10px",
              }}
            />

            <button
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
                opacity: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {competitions.length === 0 ? (
        <p>No competitions found.</p>
      ) : (
        competitions.map((comp) => (
          <CompetitionsCard key={comp._id} competition={comp} />
        ))
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}