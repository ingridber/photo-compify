import { SignInForm } from "../components/SignInForm";
import { Link } from "react-router";
import styles from "../styles/sign-in.module.css";

export function SignIn() {
    return (
        <div>

            <SignInForm/>


            <p className={styles.registerTitle}>Not a member?</p>
            <Link to="/register" className={styles.register}>
                Create an account
            </Link>


        </div>
    )
}