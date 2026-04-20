import { LoginForm } from "../components/LoginForm";
import { Link } from "react-router";

export function Login() {
    return (
        <div>
            <h2>Sign In</h2>
            <LoginForm/>

            <Link to="/">
                <button>Back</button>
            </Link>

        </div>
    )
}