import styles from "../styles/form.module.css";
import { useState } from "react";
import { login } from "../services/api";
import { useUser } from "../hooks/useUser";
import { useNavigate, useLocation, Link } from "react-router";

interface FormErrors {
    username?: string;
    password?: string;
    general?: string;
    locked?: string;
}

export function SignInForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const { setUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: FormErrors = {};

        if (!username) newErrors.username = "Username is required";
        if (!password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const res = await login(username, password);
            const data = await res.json();

            if (res.status === 200) {
                setUser({
                    _id: data._id,
                    username: data.username,
                    profilePicture: data.profilePicture || null,
                    camera: data.camera,
                    themes: data.themes,
                });

                setErrors({});
                setUsername("");
                setPassword("");
                setShowPassword(false);

                navigate(from, { replace: true });
            }

            if (res.status === 423) {
                setErrors({ locked: data.message });
                setPassword("");
            }

            if (res.status === 401) {
                setErrors({
                    general:
                        "Invalid credentials, username or password is incorrect",
                });
            }
        } catch (err) {
            setUser(null);

            if (err instanceof Error) {
                setErrors({ general: err.message });
            } else {
                setErrors({ general: "Something went wrong" });
            }
        }
    };

    return (
        <section className={styles.signInPanel}>
            <h1 className={styles.title}>Sign In</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label className={styles.label}>Username</label>

                    {errors.username && (<p className={styles.error}>{errors.username}</p>)}

                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Password</label>

                    {errors.password && (<p className={styles.error}>{errors.password}</p>)}

                    <div className={styles.passwordWrapper}>
                        <input
                            className={styles.input}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className={styles.passwordBtn}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            <img
                                src={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                                alt="toggle password"
                                className={styles.passwordIcon}
                            />
                        </button>
                    </div>
                </div>

                {errors.general && (
                    <p className={styles.error}>{errors.general}</p>
                )}

                {errors.locked && (
                    <p className={styles.error}>{errors.locked}</p>
                )}

                <div className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.saveBtn}
                        disabled={!username || !password}
                    >
                        Sign In
                    </button>
                </div>
            </form>

            <div className={styles.registerSection}>
                <p className={styles.registerTitle}>Not a member?</p>

                <Link
                    to="/register"
                    className={styles.register}
                >
                    Create an account
                </Link>
            </div>
        </section>
    );
}