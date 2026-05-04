import { Link } from "react-router";
import { useUser } from "../hooks/useUser";

export function Home() {

    const {user} = useUser();

    return (
        <div>
            <nav>
                <Link to="/login">
                    <button>Sign In</button>
                </Link>
                <Link to="/register">
                    <button>Register user</button>
                </Link>
                <Link to="/manage-account">
                    <button>Manage Account</button>
                </Link>
                <Link to="/competitions">
                    <button>Competitions</button>
                </Link>
                <Link to="/edit-profile">
                    <button>Edit Profile</button>
                </Link>
                <Link to="/create-competition">
                    <button>New competition</button>
                </Link>
            </nav>

            <h1>{`Welcome ${user?.username ? user.username.toLocaleUpperCase() : 'Stranger'} <3`}</h1>
        </div>
    )
}
