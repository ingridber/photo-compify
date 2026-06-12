import { useNavigate } from "react-router";
import styles from "../styles/form.module.css";
import btnStyle from "../components/Landingpage/landingpage.module.css";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{marginTop: "200px", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h1 className={styles.title} >page not found</h1>
            <button className={btnStyle.primaryBtn} onClick={() => navigate("/")}>
                Back to home
            </button>
        </div>
    )
}