import { Link } from "react-router";
import { useUser } from "../hooks/useUser";
// import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { DisplayLogo } from "../components/display-profile-picture/DisplayProfilePicture";
import { useTheme } from "../hooks/useTheme";

export function Home() {

    const {user} = useUser();
    const {theme, toggleTheme} = useTheme();

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <nav>
                {!user ? (
                    <Link to="/login">
                        <button>Sign In</button>
                    </Link>
                ) : (
                    <Link to="/manage-account">
                        <button>Manage Account</button>
                    </Link>
                )}

                <button onClick={toggleTheme}>
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                </button>
            </nav>

            <div style= {{width: "12rem", margin: "auto", paddingTop: "2rem",}}>
                <DisplayLogo text={true} />
            </div>

            <h1>{`Welcome ${user?.username ? user.username.toLocaleUpperCase() : 'Stranger'} <3`}</h1>
        </div>
    )
}
