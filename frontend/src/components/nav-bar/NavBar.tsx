import styles from "./navBar.module.css";
import { NavLink } from "react-router";

export function NavBar() {

    return(
        <div className={styles.navbarBackground}>
        
        <div className={styles.navbarContainer}>

            <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                <img src="/home.svg" alt="icon: Home" className={styles.navIcon}/>
                <p className={styles.navTitle}>Home</p>
            </NavLink>

            <NavLink to="/create-competition" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                <img src="/create-comp.svg" alt="icon: Create Competition" className={styles.navIcon}/>
                <p className={styles.navTitle}>Create</p>
            </NavLink>

            <NavLink to="/competitions" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                <img src="/competitions.svg" alt="icon: Competitions" className={styles.navIcon}/>
                <p className={styles.navTitle}>Comps</p>
            </NavLink>


            <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                <img src="/user.svg" alt="icon: Competitions" className={styles.navIcon}/>
                <p className={styles.navTitle}>Profile</p>
            </NavLink>


        </div>
        
        </div>
    )
}