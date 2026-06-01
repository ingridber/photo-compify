
import { useNavigate } from "react-router";
import { useUser } from "../../hooks/useUser";
import { useState, useEffect } from "react";
import { deleteAccount } from "../../services/api";
import styles from "../../styles/form.module.css";

export function DeleteAccount() {
    const navigate = useNavigate();
    const {user, setUser} = useUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [deleteCheck, setDeleteCheck] = useState("");
    const [message, setMessage] = useState("");
    const [redirect, setRedirect] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);


    useEffect(() => {
        if (!user) {navigate("/");}
        setUsername(user?.username || 'User');
    }, [user, navigate]);

    const handleDeleteAccount = async () => {
        if (deleteCheck !== "DELETE") {
            setMessage('You must type "DELETE" to confirm');
            return;
        }

        if (!password) {
            setMessage("Password needed for confirmation");
            return;
        }

        try {
            const res = await deleteAccount(password);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to delete account");
            }

            setMessage(username ? `Account ${username} successfully deleted.` : 'Account successfully deleted');
            setRedirect(true);
            setTimeout(() => {
                navigate("/");
                setUser(null);
            }, 1500);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Something went wrong");
            }
        }
    };

    return (
    <>
        {!confirmDelete ? (
            <section className={styles.changePanel}>
                
                <h1 className={styles.title}>Delete Account</h1>
                <p className={styles.helperText}>This action is permanent and cannot be undone.</p>

                <div className={styles.actions}>
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className={styles.deleteBtn}
                    >
                        Delete Account
                    </button>
                </div>
            </section>
        ) : (
            <section className={styles.changePanel}>
                <h1 className={styles.title}>Final Confirmation</h1>
                <p className={styles.warningText}>Type DELETE and enter your password to permanently remove your account.</p>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>Type DELETE to confirm</label>

                        <input
                            className={styles.input}
                            type="text"
                            placeholder="DELETE"
                            value={deleteCheck}
                            onChange={(e) => setDeleteCheck(e.target.value)}
                        />
                    </div>

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
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                <img
                                    src={showPassword ? "/eye-off.svg" : "/eye.svg"}
                                    alt="toggle password"
                                    className={styles.passwordIcon}
                                />
                            </button>
                        </div>
                    </div>

                    {message && (
                        <p className={styles.error}>{message}</p>
                    )}

                    <div className={styles.buttonContainer}>
                        <button
                            onClick={() => {
                                navigate( "/profile/account");
                                setPassword("");
                                setDeleteCheck("");
                            }}
                            className={styles.cancelBtn}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleDeleteAccount}
                            className={styles.deleteBtn}
                        >
                            Delete Forever
                        </button>
                    </div>
                </div>
            </section>
        )}
    </>
);
}