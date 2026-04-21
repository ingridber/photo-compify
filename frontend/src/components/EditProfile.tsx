import { useState } from "react";
import { Link } from "react-router"; 

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleUpdateUsername = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/v1/user/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈
        body: JSON.stringify({ newUsername: username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ text: "Username updated successfully!", isError: false });
      setUsername("");
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    }
  };

  const handleUpdatePassword = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/v1/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈
        body: JSON.stringify({ newPassword: password, confirmPassword: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ text: "Password updated successfully!", isError: false });
      setPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/v1/user/logout", {
        method: "POST",
        credentials: "include", // 👈
      });
      window.location.href = "/";
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    }
  };

  const handleDeleteAccount = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (deleteConfirm !== "DELETE") return;
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;

    try {
      const res = await fetch("http://localhost:3000/api/v1/user/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Account deleted.");
      window.location.href = "/";
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "2rem auto", fontFamily: "Arial, sans-serif", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", position: "relative" }}>
      
      <Link to="/" style={{ textDecoration: "none", color: "#555", fontSize: "0.9rem", display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        ← Back to Home
      </Link>

      <h1 style={{ textAlign: "center" }}>Profile Settings</h1>

      {message.text && (
        <div style={{ padding: "12px", marginBottom: "1.5rem", borderRadius: "5px", backgroundColor: message.isError ? "#ffdce0" : "#defabe", color: message.isError ? "#af233a" : "#3d7a22", border: `1px solid ${message.isError ? "#ff8080" : "#80ff80"}` }}>
          {message.text}
        </div>
      )}

      {/* Change Username */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h3>Update Username</h3>
        <form onSubmit={handleUpdateUsername}>
          <input type="text" placeholder="New username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }} />
          <button type="submit" style={{ cursor: "pointer", padding: "10px 20px" }}>Save Changes</button>
        </form>
      </section>

      <hr />

      {/* Change Password */}
      <section style={{ margin: "2rem 0" }}>
        <h3>Change Password</h3>
        <form onSubmit={handleUpdatePassword}>
          <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }} />
          <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }} />
          <button type="submit" style={{ cursor: "pointer", padding: "10px 20px" }}>Update Password</button>
        </form>
      </section>

      <hr />

      {/* Logout */}
      <div style={{ margin: "2rem 0" }}>
        <h3>Session</h3>
        <button
          onClick={handleLogout}
          style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#555", color: "white", border: "none", borderRadius: "5px" }}
        >
          Log Out
        </button>
      </div>

      <hr />

      {/* Delete Section */}
      <div style={{ marginTop: "2rem", padding: "20px", border: "2px solid #ff4d4d", borderRadius: "8px", backgroundColor: "#fff5f5" }}>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          To delete your account, please type <strong>DELETE</strong> in the field below.
        </p>
        <form onSubmit={handleDeleteAccount}>
          <input 
            type="text" 
            placeholder="Type DELETE to confirm" 
            value={deleteConfirm} 
            onChange={(e) => setDeleteConfirm(e.target.value)} 
            style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ff4d4d", boxSizing: "border-box" }} 
          />
          <button 
            type="submit" 
            disabled={deleteConfirm !== "DELETE"}
            style={{ 
              width: "100%", padding: "12px", borderRadius: "5px", border: "none", color: "white", fontWeight: "bold",
              backgroundColor: deleteConfirm === "DELETE" ? "#d32f2f" : "#cccccc",
              cursor: deleteConfirm === "DELETE" ? "pointer" : "not-allowed"
            }}
          >
            Permanently Delete Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;