import mixins from "../styles/mixins.module.css";
import styles from "../styles/register.module.css";
import { useState, useEffect } from "react";
import { register } from "../services/api";
import { useNavigate } from "react-router";
import { DisplayLogo } from "./display-profile-picture/DisplayProfilePicture";
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


            const res = await register(email, username, password, token);

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
            <Throbber message="Account created" action="Redirecting to Sign In" />
        ) : (
        <>
        <section className={mixins.headerContainer}>
            {/* BACK BUTTON */}
            <button 
                onClick={()=> navigate(-1)}
                className={mixins.backBtn}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={mixins.backBtnIcon} />
            </button>

            {/* TITLE & LOGO */}
            <p className={mixins.title}>Sign up</p>
            <div style= {{width: "7rem", margin: "auto"}}>
                <DisplayLogo text={true}/>
            </div>
        </section>

        <section className={mixins.contentContainer}>

            {errors.general && <p style={{ color: "red", textAlign: "center" }}>{errors.general}</p>}

            <form onSubmit={handleSubmit}>
                {/* USERNAME */}
                <div className={mixins.fieldGroup}>
                    {errors.username ? (
                        <p className={mixins.labelForInput} style={{ color: "red" }}>{errors.username}</p>
                    ) : (
                        <label htmlFor="username" className={mixins.labelForInput}>Username</label>
                    )}
                    <div className={mixins.inputFieldContainer}>
                        <input
                            id="username"
                            className={mixins.inputField}
                            required
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onBlur={e => handleBlur("username", e.target.value)}
                        />
                    </div>
                </div>

                {/* EMAIL */}
                <div className={mixins.fieldGroup}>
                    {errors.email ? (
                        <p className={mixins.labelForInput} style={{ color: "red" }}>{errors.email}</p>
                    ) : (
                        <label htmlFor="email" className={mixins.labelForInput}>Email</label>
                    )}
                    <div className={mixins.inputFieldContainer}>
                        <input
                            id="email"
                            className={mixins.inputField}
                            required
                            type="email"
                            placeholder="example@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {/* PASSWORD */}
                <div className={mixins.fieldGroup}>
                    {errors.password ? (
                        <p className={mixins.labelForInput} style={{ color: "red" }}>{errors.password}</p>
                    ) : (
                        <label htmlFor="password" className={mixins.labelForInput}>Password</label>
                    )}
                    <small>At least 1 capital letter, 1 number, and 1 symbol</small>
                    <div className={mixins.inputFieldContainer}>
                        <input
                            id="password"
                            className={mixins.inputField}
                            required
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onBlur={e => handleBlur("password", e.target.value)}
                        />
                        <button
                            className={mixins.displayPasswordBtn}
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            <img
                                className={mixins.displayPasswordBtnIcon}
                                src={showPassword ? "/eye-off.svg" : "/eye.svg"}
                                alt="Toggle password"
                            />
                        </button>
                    </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className={mixins.fieldGroup}>
                    {errors.confirmPassword ? (
                        <p className={mixins.labelForInput} style={{ color: "red" }}>{errors.confirmPassword}</p>
                    ) : (
                        <label htmlFor="confirmPassword" className={mixins.labelForInput}>Confirm password</label>
                    )}
                    <div className={mixins.inputFieldContainer}>
                        <input
                            id="confirmPassword"
                            className={mixins.inputField}
                            required
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            onBlur={e => handleBlur("confirmPassword", e.target.value)}
                        />
                        <button
                            className={mixins.displayPasswordBtn}
                            type="button"
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                        >
                            <img
                                className={mixins.displayPasswordBtnIcon}
                                src={showConfirmPassword ? "/eye-off.svg" : "/eye.svg"}
                                alt="Toggle password"
                            />
                        </button>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    className={`${mixins.submitBtn} ${styles.submitBtn}`}
                    type="submit"
                    disabled={isLoading || !username || !email || !password || !confirmPassword}
                >
                    {isLoading ? "Processing..." : "Register"}
                </button>
            </form>

        </section>
        
        </>
        )}
        </>
    );
};