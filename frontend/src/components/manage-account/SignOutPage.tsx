import { useState } from "react";
import { useNavigate } from "react-router";
import styles from "../../styles/form.module.css";

export default function SignOutDeleteAccount() {
    const [confirmSignOut, setConfirmSignOut] = useState(false);
    const navigate = useNavigate();

    return (
        <section className={styles.changePanel}>
            <h1 className={styles.title}>
                {confirmSignOut
                    ? "Confirm Sign Out"
                    : "Need a Break?"}
            </h1>

            <p className={styles.helperText}>
                {confirmSignOut
                    ? "You will be signed out from your account."
                    : "Sign out and return later whenever you're ready."}
            </p>

            {!confirmSignOut ? (
                <div className={styles.actions}>
                    <button
                        onClick={() => setConfirmSignOut(true)}
                        className={styles.saveBtn}
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <div
                    className={styles.buttonContainer}>
                    <button
                        onClick={() => navigate("/logging-out")}
                        className={styles.saveBtn}
                    >
                        Yes, Sign Out
                    </button>

                    <button
                        onClick={() => navigate("/profile/account")}
                        className={styles.cancelBtn}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </section>
    );
}