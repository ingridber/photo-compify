import { Link } from "react-router";
import { useUser } from "../hooks/useUser";

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
            </nav>

            <h1>Welcome</h1>
        </div>
    )
}