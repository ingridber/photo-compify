import { useEffect, useState } from "react";
import styles from "./Users.module.css";
import Pagination from "../competitions/Pagination";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin";
  createdAt: string;
  status?: "active" | "banned";
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetches users whenever page or search changes
  useEffect(() => {
    fetchUsers(page);
  }, [page, search]);

  // Function for fetch users from API
  async function fetchUsers(pageNumber: number) {
    const res = await fetch(
      `http://localhost:3000/api/v1/admin/users?page=${pageNumber}&limit=10&search=${search}`,
      { credentials: "include" }
    );

    // Converts the response to JSON
    const data = await res.json();

    // Updates the users state
    setUsers(data.users);
    // Updates the total pages state
    setTotalPages(data.pagination.totalPages);
  }

  // Function for updating a user´s role
  async function updateRole(id: string, role: string) {
    await fetch(`http://localhost:3000/api/v1/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });

    // Refreshes the current page after updating the role
    fetchUsers(page);
  }

  // Function for deleting a user
  async function deleteUser(userId: string) {
    // Displays a confirmation dialog before deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    // Stops execution if the action is not confirmed
    if (!confirmed) return;

    try {
      // Sends a DELETE request to the API
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/users/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete user");

      // Removes the deleted user from the local state
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
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        {/* Tabellens innehåll = table body*/}
        <tbody>
          {users.map((user) => (
            
            /* En rad för varje användare */
            <tr key={user._id}>
              
              {/* Datacell = table data*/}
              <td className={styles.userCell}>
                <div className={styles.avatar}>
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                {user.username}
              </td>

              {/* Datacell = table data*/}
              <td>{user.email}</td>

              {/* Datacell = table data*/}
              <td>
                
                {/* Dropdown-lista för val av roll */}
                <select
                  className={styles.roleSelect}
                  value={user.role}
                  onChange={(e) =>
                    updateRole(user._id, e.target.value)
                  }
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
                    user.status === "banned"
                      ? styles.banned
                      : styles.active
                  }
                >
                  {user.status ?? "Active"}
                </span>
              </td>

              {/* Datacell = table data*/}
              <td>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>

              {/* Datacell = table data*/}
              <td className={styles.actions}>
                <button onClick={() => deleteUser(user._id)}>
                  Delete user
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
)};