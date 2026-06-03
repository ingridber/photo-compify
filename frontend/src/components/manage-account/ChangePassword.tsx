import styles from "../../styles/form.module.css";
import { useState } from "react";
import { updatePassword } from "../../services/api";
import { Throbber } from "../user-feedback/Throbber";

export function ChangePassword() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (password === newPassword) {
            setMessage(
                "New password must be different from the old password."
            );
            return;
        }

        setIsLoading(true);

        try {
            const data = await updatePassword(
                password,
                newPassword,
                confirmPassword
            );

            setMessage(
                data.message || "Password updated successfully"
            );

            setPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setShowPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (err) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage(
                    "Something went wrong in API updatePassword"
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Throbber message="Updating password" action="Please wait"/>
        );
    }

    return (
        <section className={styles.changePanel}>
            <h1 className={styles.title}>Change Password</h1>

            <form
                onSubmit={handleUpdatePassword}
                className={styles.form}
            >
                <div className={styles.field}>
                    <label className={styles.label}>Current Password</label>

                    <div className={styles.passwordWrapper}>
                        <input
                            className={styles.input}
                            type={showPassword ? "text" : "password"}
                            placeholder="Current password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className={styles.passwordBtn}
                            onClick={() => setShowPassword( (prev) => !prev)}
                        >
                            <img
                                src={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                                alt="Toggle password"
                                className={styles.passwordIcon}
                            />
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>New Password</label>

                    <div className={styles.passwordWrapper}>
                        <input
                            className={styles.input}
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className={styles.passwordBtn}
                            onClick={() => setShowNewPassword((prev) => !prev)}
                        >
                            <img
                                src={showNewPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                                alt="Toggle password"
                                className={styles.passwordIcon}
                            />
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Confirm Password</label>

                    <div className={styles.passwordWrapper}>
                        <input
                            className={styles.input}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className={styles.passwordBtn}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            <img
                                src={showConfirmPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                                alt="Toggle password"
                                className={styles.passwordIcon}
                            />
                        </button>
                    </div>
                </div>

                {message && (
                    <p className={message.toLowerCase().includes("success") ? styles.success : styles.error}>
                        {message}
                    </p>
                )}

                <div className={styles.actions}>
                    <button
                        className={styles.saveBtn}
                        type="submit"
                        disabled={
                            !password ||
                            !newPassword ||
                            !confirmPassword
                        }
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </section>
    );
}