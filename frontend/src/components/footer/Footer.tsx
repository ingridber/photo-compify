import styles from "./footer.module.css";
import { NavLink } from "react-router";
import { useUser } from "../../hooks/useUser";

export default function Footer() {
    const { user } = useUser();

    return (
        <footer className={styles.footer}>
            <div className={styles.wrapperLeft}>
                <h2 className={styles.appName}>Photo Compify</h2>
                <p className={styles.appText}>
                    <span>By: </span>
                    Ingrid, Olle, Mattias, Mårten and Delzar
                </p>
                <p className={`${styles.appTextSmall} ${styles.hide}`}>
                    FJSX25 students @ Chas Academy
                </p>
                
            </div>

            <div className={styles.wrapperCenter}>
                <h2 className={styles.footerTitle}>Help</h2>

                <NavLink
                    to="/faq"
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.active}`
                            : styles.navLink
                    }
                >
                    <span className={styles.navTitle}>FAQ</span>
                </NavLink>

                <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.active}`
                            : styles.navLink
                    }
                >
                    <span className={styles.navTitle}>Contact</span>
                </NavLink>
            </div>

            <div className={styles.wrapperRight}>
                <h2 className={styles.footerTitle}>Access</h2>

                {!user && (
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            isActive
                                ? `${styles.navLink} ${styles.active}`
                                : styles.navLink
                        }
                    >
                        <span className={styles.navTitle}>Sign In</span>
                    </NavLink>
                )}

                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        isActive
                            ? `${styles.navLink} ${styles.active}`
                            : styles.navLink
                    }
                >
                    <span className={styles.navTitle}>Admin</span>
                </NavLink>
            </div>

            <p className={`${styles.appTextSmall} ${styles.copy}`}>
                    © 2026 Photo Compify
            </p>
        </footer>
    );
}