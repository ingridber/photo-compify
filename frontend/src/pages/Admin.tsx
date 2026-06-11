import styles from "../styles/admin-page.module.css";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("/admin/users");
    }
  }, [location.pathname, navigate]);

  return (
    <div className={styles.adminPage}>
      <div className={styles.menuContainer}>
        <h1>Admin</h1>

        <button
          onClick={() => navigate("/admin/users")}
          className={`${styles.menuButton} ${
            location.pathname.startsWith("/admin/users")
              ? styles.active
              : ""
          }`}
        >
          Users
        </button>

        <button
          onClick={() => navigate("/admin/competitions")}
          className={`${styles.menuButton} ${
            location.pathname.startsWith("/admin/competitions")
              ? styles.active
              : ""
          }`}
        >
          Competitions
        </button>

        <button
          onClick={() => navigate("/admin/reports")}
          className={`${styles.menuButton} ${
            location.pathname.startsWith("/admin/reports")
              ? styles.active
              : ""
          }`}
        >
          Reports
        </button>
      </div>

      <div className={styles.outletContainer}>
        <Outlet />
      </div>
    </div>
  );
}