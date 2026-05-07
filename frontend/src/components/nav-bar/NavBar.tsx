import styles from "./navBar.module.css";
import { Link } from "react-router";

export function NavBar() {

    return(
        <>
        
        <div className={styles.navbarContainer}>

            <Link to="/" className={styles.navLink}>
                <img src="/home.svg" alt="icon: Home" className={styles.navIcon}/>
                <p className={styles.navTitle}>Home</p>
            </Link>

            <Link to="/create-competition" className={styles.navLink}>
                <img src="/create-comp.svg" alt="icon: Create Competition" className={styles.navIcon}/>
                <p className={styles.navTitle}>Create</p>
            </Link>

            <Link to="/competitions" className={styles.navLink}>
                <img src="/competitions.svg" alt="icon: Create Competition" className={styles.navIcon}/>
                <p className={styles.navTitle}>Comps</p>
            </Link>


        </div>
        
        </>
    )
}