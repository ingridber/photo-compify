import { useEffect, useState } from "react";
import styles from "./Users.module.css";
import Pagination from "../competitions/Pagination";
import { fetchUsers, updateRole, deleteUser } from "../../services/api";
import { formatLastLogin } from "../../utils/formatLastLogin";

interface User {
  _id: string;
  username: string;
  email: string;
  warnings: number;
  role: "user" | "moderator" | "admin";
  createdAt: string;
  status?: "active" | "suspended";
  lastLogin?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetches users whenever page or search changes
  useEffect(() => {
  if (search.trim().length < 2) {
    setUsers([]);
    setTotalPages(1);
    return;
  }

  // eslint-disable-next-line react-hooks/immutability
  loadUsers(page, search);
}, [page, search]);

  //--------------load users--------------
  async function loadUsers(pageNumber: number, search: string) {
    try {
      const data = await fetchUsers(pageNumber, search);

      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.log(error);
    }
  }

  //--------------update users--------------
  async function handleUpdateRole(id: string, role: string) {
    const confirmed = window.confirm(
      "Are you sure you want to update the role for this user?",
    );

    if (!confirmed) return;

    try {
      await updateRole(id, role);
      loadUsers(page, search);
    } catch (error) {
      console.log(error);
    }
  }

  //--------------delete users--------------
  async function handleDeleteUser(userId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) return;

    try {
      await deleteUser(userId);

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Users</h1>
          <p>Manage all users on the platform</p>
        </div>

        <input
          className={styles.search}
          placeholder="Search by username, email or role..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value)
            setPage(1);

            if(value.trim().length < 2) {
              setUsers([]);
              setTotalPages(1);
            }
          }}
        />
      </div>

      {/* TABLE =  tabell*/}
      <div className={styles.card}>
        {/* Själva tabellen */}
        <table className={styles.table}>
          {/* Tabellens rubrikdel */}
          <thead>
            {/* En rad med kolumnrubriker = table row*/}
            <tr>
              {/* Rubrikcell = table header*/}
              <th>User</th>
              <th>Email</th>
              <th>Last Login</th>
              <th>Warnings</th>
              <th>Role</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>

          {/* Tabellens innehåll = table body*/}
          <tbody>
            {users.map((user) => (
              /* En rad för varje användare */
              <tr key={user._id}>
                {/* Datacell = table data*/}
                <td className={styles.userCell}>{user.username}</td>

                {/* Datacell = table data*/}
                <td>{user.email}</td>

                <td>{formatLastLogin(user.lastLogin)}</td>

                <td>
                  <span className={styles.warnings}>{user.warnings ?? 0}</span>
                </td>

                {/* Datacell = table data*/}
                <td>
                  {/* Dropdown-lista för val av roll */}
                  <select
                    className={`${styles.roleSelect} ${
                      user.role === "admin"
                        ? styles.roleAdmin
                        : user.role === "moderator"
                          ? styles.roleModerator
                          : styles.roleUser
                    }`}
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                {/* Datacell = table data*/}
                <td>
                  <span
                    className={
                      (user.warnings ?? 0) >= 3 || user.status === "suspended"
                        ? styles.suspended
                        : styles.active
                    }
                  >
                    {(user.warnings ?? 0) >= 3 || user.status === "suspended"
                      ? "suspended"
                      : (user.status ?? "active")}
                  </span>
                </td>

                {/* Datacell = table data*/}
                <td className={styles.actions}>
                  <button onClick={() => handleDeleteUser(user._id)}>
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
