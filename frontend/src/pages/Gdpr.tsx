import styles from "../styles/gdpr-page.module.css";
import { useUser } from "../hooks/useUser";
import { exportMyData } from "../services/exportMyData";
import { useState } from "react";

export default function Gdpr() {

    const {user} = useUser();
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

        <div className={styles.gdprPage}>

            <h2 className={styles.title}>
                Our data protection practices
            </h2>
            <p>
                text om det här
            </p>

            { user && (
                <>
            <h2 className={styles.title}>
                Collect your data
            </h2>
            <button onClick={handleExport}>
                Download your data
            </button>
            </>

            )

            }


        </div>
    )
}