import { SignInForm } from "../components/LoginForm";
import { Link } from "react-router";

export function SignIn() {
    return (
        <div>
            <h2>Sign In</h2>
            <SignInForm/>

            <Link to="/">
                <button>Back</button>
            </Link>

        </div>
    )
}