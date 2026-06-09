import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./HamburgerMenu.module.css";
import { useUser } from "../../hooks/useUser";
import { DisplayProfilePicture } from "../display-profile-picture/DisplayProfilePicture";
import { logout } from "../../services/api";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useUser();
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

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <nav className={styles.navbar} ref={menuRef}>
        {/* HAMBURGER */}
          <button
            className={styles.hamburger}
            onClick={() => setOpen(prev => !prev)}
          >
            {open ? (
              <img
                src="/icons/close.svg"
                alt=""
                className={styles.hamburgerIcon}
              />
            ) : (
              <div className={styles.profileContainer}>
                <DisplayProfilePicture src={user?.profilePicture?.url}/>
              </div>
            )}
          </button>

      {/* DROPDOWN */}
        <div
          className={`
            ${styles.dropdown}
            ${open ? styles.dropdownOpen : ""}
          `}
        >
          {!user ? (
            <>
              <button
                onClick={() => goTo("/login")}
                className={styles.menuBtn}
              >
                Sign in
              </button>

            </>
          ) : (
            <>


              <button
                onClick={() =>
                  goTo("/profile/competitions")}
                className={styles.menuBtn}
              >
                My Competitions
              </button>

              <button
                onClick={() => goTo("/profile/account")}
                className={styles.menuBtn}
              >
                Manage account
              </button>


              <button
                onClick={handleLogout}
                className={styles.menuBtn}
              >
                Sign out
              </button>


            </>
          )}
        </div>
      
    </nav>
  );
}