import { useEffect, useState } from "react";
import styles from "./Competition.module.css";
import Pagination from "../competitions/Pagination";
import {
  fetchCompetitionsForAdminPage,
  updateCompetitionsForAdminPage,
  deleteCompetitionsForAdminPage,
} from "../../services/admin";

interface Competition {
  _id: string;
  title: string;
  phase: "submission" | "voting" | "ended";
  createdAt: string;
}

export default function Competitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const hasSearched = search.trim().length >= 2;
    const hasPhaseFilter = phaseFilter !== "";

    if(!hasSearched && !hasPhaseFilter) {
      setCompetitions([]);
      setTotalPages(1);
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    loadCompetitions(page, search, phaseFilter);
  }, [page, search, phaseFilter]);

  // ---------- load competitions ----------
  async function loadCompetitions(
    pageNumber: number,
    searchValue: string,
    phaseValue: string,
  ) {
    try {
      const data = await fetchCompetitionsForAdminPage(
        pageNumber,
        searchValue,
        phaseValue,
      );

      setCompetitions(data.competitions);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.log(error);
    }
  }

  // ---------- update competitions ----------
  async function handleUpdateCompetitions(
    id: string,
    data: Partial<Competition>,
  ) {
    const confirmed = window.confirm(
      "are you sure you want to update this competition?",
    );

    if (!confirmed) return;

    try {
      await updateCompetitionsForAdminPage(id, data);

      window.dispatchEvent(new Event("competitionsUpdated"));

      loadCompetitions(page, search, phaseFilter);
    } catch (error) {
      console.log(error);
    }
  }

  // ---------- delete competitions ----------
  async function handleDeleteCompetitions(id: string) {
    const competition = competitions.find((c) => c._id === id);

    if (competition?.phase === "ended") {
    window.alert("Cannot delete an ended competition!");
    return;
  }
    const confirmed = window.confirm(
      "are you sure you want to delete this competition?",
    );

    if (!confirmed) return;

    try {
      await deleteCompetitionsForAdminPage(id);

      setCompetitions((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.log(error);
    }
  }

 return (
  <div className={styles.page}>
    {/* HEADER */}
    <div className={styles.header}>
      <div>
        <h1>Competitions</h1>
        <p>Manage all competitions on the platform</p>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={styles.competitionFilter}
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
        >
          <option value="">Choose phase</option>
          <option value="submission">Submission</option>
          <option value="voting">Voting</option>
          <option value="ended">Ended</option>
        </select>
      </div>
    </div>

    {/* TABLE */}
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Phase</th>
            <th>Created</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {competitions.map((c) => (
            <tr key={c._id}>
              <td>
                <input
                  value={c.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;

                    setCompetitions((prev) =>
                      prev.map((item) =>
                        item._id === c._id
                          ? { ...item, title: newTitle }
                          : item,
                      ),
                    );
                  }}
                  onBlur={(e) =>
                    handleUpdateCompetitions(c._id, {
                      title: e.target.value,
                    })
                  }
                />
              </td>

              <td>
                <select
                  className={`${styles.compSelect} ${
                    c.phase === "submission"
                      ? styles.compUser
                      : c.phase === "voting"
                        ? styles.compModerator
                        : styles.compAdmin
                  }`}
                  value={c.phase}
                  onChange={(e) => {
                    const newPhase =
                      e.target.value as Competition["phase"];

                    setCompetitions((prev) =>
                      prev.map((item) =>
                        item._id === c._id
                          ? { ...item, phase: newPhase }
                          : item,
                      ),
                    );

                    handleUpdateCompetitions(c._id, {
                      phase: newPhase,
                    });
                  }}
                >
                  <option value="submission">Submission</option>
                  <option value="voting">Voting</option>
                  <option value="ended">Ended</option>
                </select>
              </td>

              <td>
                {new Date(c.createdAt).toLocaleDateString()}
              </td>

              <td className={styles.actions}>
                <button
                  onClick={() =>
                    handleDeleteCompetitions(c._id)
                  }>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7L18.133 19.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  </div>
)}