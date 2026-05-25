import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./HamburgerMenu.module.css";
import { useTheme } from "../../hooks/useTheme";
import { useUser } from "../../hooks/useUser";
import { DisplayLogo } from "../display-profile-picture/DisplayProfilePicture";
import { NotificationMenu } from "./NotificationMenu";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goTo = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <nav className={styles.navbar} ref={menuRef}>
      <div
        className={styles.logoContainer}
        onClick={() => goTo("/")}
      >
        <DisplayLogo text={false} />
      </div>

      <div className={styles.navActions}>
        <NotificationMenu notifications={[]} />

        {/* HAMBURGER */}
        <button
          className={styles.hamburger}
          onClick={() => setOpen(prev => !prev)}
        >
          {open ? (
            <img
              src="/close.svg"
              alt=""
              className={styles.hamburgerIcon}
            />
          ) : (
            <img
              src="/menu.svg"
              alt=""
              className={styles.hamburgerIcon}
            />
          )}
        </button>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className={styles.dropdown}>
          {!user ? (
            <>
              <button
                onClick={() => goTo("/login")}
                className={styles.menuBtn}
              >
                Sign in
              </button>

              <button
                onClick={toggleTheme}
                className={styles.menuBtn}
              >
                {theme === "light"
                  ? "Dark Mode"
                  : "Light Mode"}
              </button>
            </>
          ) : (
            <>
              <span className={styles.username}>
                Signed in as:{" "}
                {user?.username?.toLocaleUpperCase()}
              </span>

              <button
                onClick={() => goTo("/manage-account")}
                className={styles.menuBtn}
              >
                Manage account
              </button>

              <button
                onClick={() =>
                  goTo("/profile/competitions")}
                className={styles.menuBtn}
              >
                My Competitions
              </button>

              <button
                onClick={toggleTheme}
                className={styles.menuBtn}
              >
                {theme === "light"
                  ? "Dark Mode"
                  : "Light Mode"}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}