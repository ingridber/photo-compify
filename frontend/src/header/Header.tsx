import { useNavigate } from "react-router";
import { DisplayLogo } from "../components/display-profile-picture/DisplayProfilePicture";
import { NotificationMenu } from "../components/nav-bar/NotificationMenu";
import HamburgerMenu from "../components/nav-bar/HamburgerMenu";
import styles from "./Header.module.css";

export default function Header() {
    const navigate = useNavigate();

    return (
        <header className={styles.header}>
            <div
                className={styles.logoContainer}
                onClick={() => navigate("/")}
            >
                <DisplayLogo text={false} />
            </div>

            <div className={styles["wrapper-right"]}>
                <NotificationMenu />
                <HamburgerMenu />
            </div>
        </header>
    );
}