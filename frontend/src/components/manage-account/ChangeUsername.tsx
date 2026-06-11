import styles from "../../styles/form.module.css";
import { useState } from "react";
import { updateUsername } from "../../services/user";
import { useUser } from "../../hooks/useUser";
import { Throbber } from "../user-feedback/Throbber";

export function ChangeUsername() {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { setUser } = useUser();

    const handleUpdateUsername = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const data = await updateUsername(username);

            setUser((prev) =>
                prev
                    ? {
                          ...prev,
                          username: data.username,
                      }
                    : null
            );

            setMessage(
                data.message || "Username updated successfully"
            );

            setUsername("");
        } catch (err) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Something went wrong");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Throbber message="Updating username" action="Please wait"/>
        );
    }

    return (
        <section className={styles.changePanel}>
            <h1 className={styles.title}>Change Username</h1>

            <form
                onSubmit={handleUpdateUsername}
                className={styles.form}
            >
                <div className={styles.field}>
                    <label className={styles.label}>New Username</label>

                    <input
                        className={styles.input}
                        required
                        type="text"
                        placeholder="New username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setMessage("");
                        }}
                    />
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
                        disabled={!username}
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </section>
    );
}