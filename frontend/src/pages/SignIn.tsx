import { SignInForm } from "../components/SignInForm";
import { Link } from "react-router";

export function SignIn() {
    return (
        <div>
            <h2>Sign In</h2>
            <SignInForm/>

            <br /> {/* !!!!! TA BORT SEN !!!!! */}
            <p>Not a member?</p>
            <Link to="/register">
                <p>Create an account</p>
            </Link>
            <br /> {/* !!!!! TA BORT SEN !!!!! */}
            <Link to="/">
                <button>Back</button>
            </Link>

        </div>
    )
}