import styles from "../styles/gdpr-page.module.css";
import { useUser } from "../hooks/useUser";
import { exportMyData } from "../services/exportMyData";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Gdpr() {
    const {user} = useUser();
    const [isExporting, setIsExporting] = useState(false);
    const navigate = useNavigate();

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
        <div className={styles.gdprPage}>
            <h2 className={styles.title}>Our data protection practices</h2>
            <p>We take the protection of your personal data seriously. Photo Compify stores only the information necessary to provide the service, such as account details, competition submissions, and uploaded images. Access to personal data is restricted to authorized personnel, and we use appropriate technical and organizational measures to safeguard your information. We do not sell personal data to third parties.</p>

            { user && (
            <>
                <h2 className={styles.title}>Collect your data</h2>
                <p>Download a copy of the personal data we store about you, including your account information, submissions, uploaded images, and competition activity.</p>
                <button onClick={handleExport}>Download your data</button>

                <h2 className={styles.title}>Delete your account</h2>
                <p>To delete your account and all data associated with it, navigate to Manage Account and select Delete Account, or simply use the button below.</p>
                <button onClick={() => navigate("/profile/account/delete-account")}>Redirect to delete account</button>
            </>
            )}
        </div>
    )
}