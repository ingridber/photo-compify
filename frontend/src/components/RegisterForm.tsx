import styles from "../styles/form.module.css";
import { useState, useEffect } from "react";
import { register } from "../services/api";
import { useNavigate } from "react-router";
import { Throbber } from "./user-feedback/Throbber";

const SITE_KEY = "6Lfr5dgsAAAAAAh2wY2jQK-Pb4QalmOyznzsEA7j";
const usernameRegex = /^[^\u0080-\uFFFF]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).+$/;

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

declare global {
    interface Window {
        grecaptcha: {
            ready: (cb: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!document.querySelector(`script[src*="recaptcha/api.js"]`)) {
            const script = document.createElement("script");
            script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
            script.async = true;
            document.body.appendChild(script);
            return () => {
                const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
                if (existingScript) document.body.removeChild(existingScript);
            };
        }
    }, []);

    function validateUsername(value: string): string | undefined {
        if (value.length <= 2) return "Username must be longer than 2 characters";
        if (value.length >= 80) return "Username must be less than 80 characters";
        if (!usernameRegex.test(value)) return "Username must contain ASCII characters only";
    }

    function validatePassword(value: string): string | undefined {
        if (value.length < 8) return "Password must be at least 8 characters";
        if (value.length > 128) return "Password must be less than 128 characters";
        if (!passwordRegex.test(value)) return "Password must contain at least 1 capital letter, 1 number, and 1 symbol";
    }

    function validateConfirmPassword(value: string): string | undefined {
        if (value !== password) return "Passwords do not match";
    }

    function handleBlur(field: keyof FormErrors, value: string) {
        let error: string | undefined;
        if (field === "username") error = validateUsername(value);
        if (field === "password") error = validatePassword(value);
        if (field === "confirmPassword") error = validateConfirmPassword(value);
        setErrors(prev => ({ ...prev, [field]: error }));
    }

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});

        const usernameError = validateUsername(username);
        const passwordError = validatePassword(password);
        const confirmPasswordError = validateConfirmPassword(confirmPassword);

        if (usernameError || passwordError || confirmPasswordError) {
            setErrors({ username: usernameError, password: passwordError, confirmPassword: confirmPasswordError });
            return;
        }

        setIsLoading(true);

        try {
            if (!window.grecaptcha) {
                throw new Error("reCAPTCHA script not loaded. Check your internet connection or AdBlocker.");
            }

            // Hämta token från Google
            const token = await new Promise<string>((resolve, reject) => {
                window.grecaptcha.ready(() => {
                    window.grecaptcha
                        .execute(SITE_KEY, { action: "create_account" })
                        .then(resolve)
                        .catch(reject);
                });
            });


            const res = await register(email, username, password, confirmPassword, token);

            if (res.status === 201) {
                setRedirect(true);
                setTimeout(() => {
                    navigate("/login", { replace: true });
                }, 1800);
                
            } else if (res.status === 409) {
                const data = await res.json();
                if (data.code === "USER_ALREADY_REGISTERED") {
                    setErrors(prev => ({ ...prev, username: "Username is already taken" }));
                }
            } else if (res.status === 400) {
                const data = await res.json();
                if (data.code === "RECAPTCHA_FAILED") {
                    setErrors(prev => ({ ...prev, general: "Security check failed. Please try again." }));
                } else {
                    setErrors(prev => ({ ...prev, general: data.message || "Registration failed" }));
                }
            }
        } catch (err: any) {
            console.error("Registration error:", err);
            setErrors(prev => ({ ...prev, general: err.message || "An unexpected error occurred" }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
    <>
        {redirect ? (
            <Throbber message="Account created" action="Redirecting to Sign In"/>
        ) : (
            <section className={styles.signInPanel}>
                <h1 className={styles.title}>Sign Up</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {errors.general && (
                        <p className={styles.error}>{errors.general}</p>
                    )}

                    {/* USERNAME */}
                    <div className={styles.field}>
                        <label className={styles.label}>Username</label>

                        {errors.username && (
                            <p className={styles.error}>{errors.username}</p>
                        )}

                        <input
                            className={styles.input}
                            required
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            onBlur={(e) =>
                                handleBlur("username", e.target.value)
                            }
                        />
                    </div>

                    {/* EMAIL */}
                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>

                        {errors.email && (
                            <p className={styles.error}>{errors.email}</p>
                        )}

                        <input
                            className={styles.input}
                            required
                            type="email"
                            placeholder="example@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className={styles.field}>
                        <label className={styles.label}>Password</label>

                        <span className={styles.helperText}>At least 1 capital letter, 1 number, and 1 symbol</span>

                        {errors.password && (
                            <p className={styles.error}>{errors.password}</p>
                        )}

                        <div className={styles.passwordWrapper}>
                            <input
                                className={styles.input}
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={(e) => handleBlur("password", e.target.value)}
                            />

                            <button
                                type="button"
                                className={styles.passwordBtn}
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                <img
                                    src={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                                    alt="Toggle password"
                                    className={styles.passwordIcon}/>
                            </button>
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className={styles.field}>
                        <label className={styles.label}>Confirm Password</label>

                        {errors.confirmPassword && (
                            <p className={styles.error}>{errors.confirmPassword}</p>
                        )}

                        <div className={styles.passwordWrapper}>
                            <input
                                className={styles.input}
                                required
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
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

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={
                                isLoading ||
                                !username ||
                                !email ||
                                !password ||
                                !confirmPassword
                            }
                        >
                            {isLoading ? "Processing..." : "Register"}
                        </button>
                    </div>
                </form>
            </section>
        )}
    </>
);
};