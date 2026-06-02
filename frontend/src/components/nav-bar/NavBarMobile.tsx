import styles from "./navBarMobile.module.css";
import { NavLink } from "react-router";
import { useUser } from "../../hooks/useUser";

export function NavBarMobile() {
    const {user} = useUser();

    return(
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
            <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                <img src="/icons/home.svg" alt="icon: Home" className={styles.navIcon}/>
                <span className={styles.navTitle}>Home</span>
            </NavLink>
            <NavLink to="/create-competition" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                <img src="/icons/create-comp.svg" alt="icon: Create Competition" className={styles.navIcon}/>
                <span className={styles.navTitle}>Create</span>
            </NavLink>
            <NavLink to="/competitions" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                <img src="/icons/competitions.svg" alt="icon: Competitions" className={styles.navIcon}/>
                <span className={styles.navTitle}>Comps</span>
            </NavLink>
            { !user ? (
                <NavLink to="/login" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                    <img src="/icons/user.svg" alt="icon: Competitions" className={styles.navIcon}/>
                    <span className={styles.navTitle}>Sign in </span>
                </NavLink>

            ):(
                <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                    <img src="/icons/user.svg" alt="icon: Competitions" className={styles.navIcon}/>
                    <span className={styles.navTitle}>Profile</span>
                </NavLink>
            )
            }
        </div>
    </nav>

    )
}