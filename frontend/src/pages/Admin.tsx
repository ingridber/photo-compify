import styles from "../styles/admin-page.module.css";
import { Outlet, useNavigate, useLocation } from "react-router";

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={styles.adminPage}>
      <div className={styles.menuContainer}>

        <h1>Admin</h1>
        <button
          onClick={() => navigate("/admin/users")}
          className={
            location.pathname.startsWith("/admin/users") ? styles.active : ""
          }
        >
          Users
        </button>

        <button
          onClick={() => navigate("/admin/competitions")}
          className={
            location.pathname.startsWith("/admin/competitions")
              ? styles.active
              : ""
          }
        >
          Competitions
        </button>

        <button
          onClick={() => navigate("/admin/images")}
          className={
            location.pathname.startsWith("/admin/images") ? styles.active : ""
          }
        >
          Images
        </button>

        <button
          onClick={() => navigate("/admin/reports")}
          className={
            location.pathname.startsWith("/admin/reports") ? styles.active : ""
          }
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
