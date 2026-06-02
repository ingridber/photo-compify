import styles from "../styles/manage-account.module.css";
import profileStyle from "../components/profile/profile.module.css";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useUser } from "../hooks/useUser";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { useState } from "react";
import { exportMyData } from "../services/exportMyData";


export function ManageAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
const [isExporting, setIsExporting] = useState(false);

const handleExport = async () => {
  if (isExporting) return;
  try {
    setIsExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await exportMyData();
  } catch (err) {
    console.error(err);
    alert("Failed to export data");
  } finally {
    setIsExporting(false);
  }
};
  return (
    <>
      <header className={styles.header}>
        <div className={styles.hero}>
          <div className={styles.profilePicContainer}>
            <div className={styles.profilePic}>
              <DisplayProfilePicture src={user?.profilePicture?.url}/>
            </div>

            <button
              className={styles.uploadLogoBtn}
              onClick={() => navigate("change-picture")}
            >
              Edit Picture
            </button>
          </div>

          <div className={styles.heroMeta}>
            <p className={styles.heroEyebrow}>Photographer</p>
            <h1 className={styles.heroName}>{user ? user.username : "USER"}</h1>
          </div>
        </div>

        <div className={styles.optionsRow}>
          <div
            className={`${styles.optionCell} ${styles.optionClickable} 
                ${location.pathname.includes("change-username")
                ? styles.activeOption
                : ""
            }`}
            onClick={() => navigate("change-username")}
          >
            <span className={styles.small}>Change</span>
            <span className={styles.large}>Username</span>
          </div>

          <div
            className={`${styles.optionCell} ${styles.optionClickable} 
              ${location.pathname.includes("change-password")
                ? styles.activeOption
                : ""
            }`}
            onClick={() => navigate("change-password")}
          >
            <span className={styles.small}>Change</span>
            <span className={styles.large}>Password</span>
          </div>

          {/* Download your data */}
           <div
              className={`${styles.optionCell} ${styles.optionClickable}
                ${location.pathname.includes("export-my-data")
                  ? styles.activeOption
                  : ""
              }`}
              onClick={handleExport}
            >
              <span className={styles.small}>Download</span>
              <span className={styles.large}>your data</span>
            </div>

          <div
            className={`${styles.optionCell} ${styles.optionClickable} 
              ${location.pathname.includes("delete-account")
                ? styles.activeOption
                : ""
            }`}
            onClick={() => navigate("delete-account")}
          >
            <span className={styles.small}>Delete</span>
            <span className={styles.large}>Account</span>
          </div>

          <div
            className={`${styles.optionCell} ${styles.optionClickable} 
            ${location.pathname.includes("logout")
                ? styles.activeOption
                : ""
            }`}
            onClick={() => navigate("logout")}
          >
            <span className={styles.small}>Sign</span>
            <span className={styles.large}>Out</span>
          </div>
        </div>
      </header>

      <div className={profileStyle.outletContainer}>
        <Outlet />
      </div>
    </>
  );
}