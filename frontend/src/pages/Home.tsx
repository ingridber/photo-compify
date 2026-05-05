import { Link } from "react-router";
import { useUser } from "../hooks/useUser";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { Throbber } from "../components/user-feedback/Throbber";

export function Home() {

    const {user} = useUser();

    return (
        <div>
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

                <Link to="/competitions">
                    <button>Competitions</button>
                </Link>
                <Link to="/create-competition">
                     <button>New competition</button>
               </Link>
            </nav>

            <div style= {{width: "12rem", margin: "auto", paddingTop: "2rem",}}>
                <DisplayProfilePicture src={"/logo.png"} />
            </div>

            <h1>{`Welcome ${user?.username ? user.username.toLocaleUpperCase() : 'Stranger'} <3`}</h1>
        </div>
    )
}
