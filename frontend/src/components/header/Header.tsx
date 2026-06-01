import { useNavigate } from "react-router";
import { NotificationMenu } from "../nav-bar/NotificationMenu";
import HamburgerMenu from "../nav-bar/HamburgerMenu";
import styles from "./Header.module.css";
import { NavLink } from "react-router";
import ToggleTheme from "./ToggleTheme";
import { useUser } from "../../hooks/useUser";

export default function Header() {
    const navigate = useNavigate();
    const {user} = useUser();

    return (
        <header className={styles.header}>
            <div className={styles['wrapper-left']}>
                <h1 className={styles.appName} onClick={() => navigate("/")}>
                    Photo Compify
                </h1>
            </div>

            <div className={styles.navLinksContainer}>
                <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                    <span className={styles.navTitle}>Home</span>
                </NavLink>
                <NavLink to="/competitions" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                    <span className={styles.navTitle}>Comps</span>
                </NavLink>
                <NavLink to="/create-competition" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                    <span className={styles.navTitle}>Create</span>
                </NavLink>


                { !user ? (
                    <NavLink to="/login" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                        <span className={styles.navTitle}>Sign in</span>
                    </NavLink>
                ):(
                    <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}`: styles.navLink}>
                        <span className={styles.navTitle}>Profile</span>
                    </NavLink>
                )}
                
            </div>

            <div className={styles["wrapper-right"]}>
                <ToggleTheme />
                { user && (
                    <>
                    <NotificationMenu />
                    <HamburgerMenu />
                    </>
                )}
            </div>

        </header>
    );
}