import { Link } from "react-router";
import { useUser } from "../hooks/useUser";
// import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { DisplayLogo } from "../components/display-profile-picture/DisplayProfilePicture";

export function Home() {

    const {user} = useUser();

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
            </nav>

            <div style= {{width: "12rem", margin: "auto", paddingTop: "2rem",}}>
                <DisplayLogo text={true} />
            </div>

            <h1>{`Welcome ${user?.username ? user.username.toLocaleUpperCase() : 'Stranger'} <3`}</h1>
        </div>
    )
}
