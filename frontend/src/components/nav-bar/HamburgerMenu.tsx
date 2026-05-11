import { useState } from "react";
import { useNavigate } from "react-router";
import styles from "./HamburgerMenu.module.css";
import { useTheme } from "../../hooks/useTheme";
import { useUser } from "../../hooks/useUser";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {theme, toggleTheme} = useTheme();
  const {user} = useUser();

  const goTo = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      {/* HAMBURGER */}
      <button
        className={styles.hamburger}
        onClick={() => setOpen(prev => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      

      {/* DROPDOWN */}
      {open && (
  <div className={styles.dropdown}>
    {!user ? (
      <>
        <button onClick={() => goTo("/login")}>Sign in</button>
        <button onClick={toggleTheme}>
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </>
    ) : (
      <>
        <span className={styles.username}>
        Signed in as: {user?.username?.toLocaleUpperCase()}
        </span>
        <button onClick={() => goTo("/manage-account")}>Manage account</button>
        <button onClick={() => goTo("/competitions")}>Competitions</button>
        <button onClick={toggleTheme}>
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </>
    )}
  </div>
)}
    </nav>
  );
}