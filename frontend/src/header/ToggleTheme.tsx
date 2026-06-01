import { useTheme } from "../hooks/useTheme";
import styles from "./toggleTheme.module.css";

export default function ToggleTheme() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={styles.toggleThemeBtn}
            aria-label="Change theme"
        >
            {theme === "light" ? (
                <img
                    src="/moon.svg"
                    alt="Activate dark mode"
                    className={styles.darkMode}
                />
            ) : (
                <img
                    src="/sun.svg"
                    alt="Activate light mode"
                    className={styles.lightMode}
                />
            )}
        </button>
    );
}