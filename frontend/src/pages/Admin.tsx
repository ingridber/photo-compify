import styles from "../styles/admin-page.module.css";
import { Outlet } from "react-router";
import { useNavigate } from "react-router";

export default function Admin() {
    const navigate = useNavigate();


    return (
    <div className={styles.adminPage}>

    
    <div className={styles.menuContainer}>
        <button onClick={() => navigate("/admin/reports")}> 
            Reports
        </button>

    </div>

    <div className={styles.outletContainer}>
        <Outlet />
    </div>
    </div>
    )
}