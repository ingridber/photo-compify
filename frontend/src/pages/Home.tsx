import { Link } from "react-router";

export function Home() {
    return (
        <div>
            <nav>
                <Link to="/login">
                    <button>Sign In</button>
                </Link>
                <Link to="/register">
                    <button>Register user</button>
                </Link>
                <Link to="/edit-profile">
                    <button>Edit Profile</button>
                </Link>
            </nav>

            <h1>Welcome</h1>
        </div>
    )
}