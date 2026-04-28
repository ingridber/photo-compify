import mixins from "../styles/mixins.module.css";
import styles from "../styles/register.module.css";
import { useState } from "react";
import { register } from "../services/api";
import { useNavigate } from "react-router";
import { DisplayProfilePicture } from "./display-profile-picture/DisplayProfilePicture";
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column" };

const usernameRegex = /^[^\u0080-\uFFFF]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).+$/;

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const navigate = useNavigate();

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

        const usernameError = validateUsername(username);
        const passwordError = validatePassword(password);
        const confirmPasswordError = validateConfirmPassword(confirmPassword);

        if (usernameError || passwordError || confirmPasswordError) {
            setErrors({ username: usernameError, password: passwordError, confirmPassword: confirmPasswordError });
            return;
        }

        try {
            const res = await register(email, username, password);
            if (res.status === 201) {
                navigate("/login", {replace: true});
            }
            if (res.status === 409) {
                const data = await res.json();
                if (data.code === "USER_ALREADY_REGISTERED") {
                    setErrors(prev => ({ ...prev, username: "Username is already taken" }));
                }
                return;
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (

        <section className={mixins.sectionContainer}>
            {/* BACK BUTTON */}
            <button 
                onClick={()=> navigate(-1)}
                className={mixins.backBtn}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={mixins.backBtnIcon} />
            </button>

            {/* TITLE & LOGO */}
            <p className={styles.title}>Sign up</p>
            <div style= {{width: "7rem", margin: "auto", paddingBottom: "1.5rem"}}>
                <DisplayProfilePicture src={'https://velvetescape.com/wp-content/uploads/2009/06/IMG_0136-1280x920.jpeg'} />
            </div>



            {/* REGISTER FORM  */}


            <form onSubmit={handleSubmit}> 

            {/* FIELD GROUP: USERNAME */}
            <div className={mixins.fieldGroup}>

                <label htmlFor="username" className={mixins.labelForInput}>
                    Username</label>
                
                {errors.username && <small style={{ color: "red" }}> - {errors.username}</small>}

                <div className={mixins.inputFieldContainer}>
                    <input
                        id="username"
                        className={mixins.inputField}
                        required
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onBlur={e => handleBlur("username", e.target.value)}/>
                </div>
            </div>

            {/* FIELD GROUP: EMAIL */}
            <div className={mixins.fieldGroup}>

                <label htmlFor="email" className={mixins.labelForInput}>
                    Email</label>

                {errors.email && <small style={{ color: "red" }}> - {errors.email}</small>}

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

            {/* FIELD GROUP: PASSWORD */}
            <div className={mixins.fieldGroup}>

                <label htmlFor="password" className={mixins.labelForInput}>
                    Password</label>

                {errors.password && <small style={{ color: "red" }}> - {errors.password}</small>}
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
                        onClick={() => setShowPassword(prev => !prev)}>
                            <img
                                className={mixins.displayPasswordBtnIcon}
                                src={showPassword ? "/eye-off.svg" : "/eye.svg"} 
                                alt={showPassword ? "icon for displaying password" : "icon for hideing password"}  />
                    </button>
                </div>
            </div>

            {/* FIELD GROUP: CONFIRM PASSWORD */}
            <div className={mixins.fieldGroup}>
                <label 
                    htmlFor="confirmPassword"
                    className={mixins.labelForInput}>
                        Confirm password</label>
                 
                 {errors.confirmPassword && <small style={{ color: "red" }}> - {errors.confirmPassword}</small>}

                <div className={mixins.inputFieldContainer}> 
                    <input
                        id="confirmPassword"
                        className={mixins.inputField}
                        required
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        onBlur={e => handleBlur("confirmPassword", e.target.value)}/>
                    <button
                        className={mixins.displayPasswordBtn}
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}>
                            <img
                                className={mixins.displayPasswordBtnIcon}
                                src={showConfirmPassword ? "/eye-off.svg" : "/eye.svg"} 
                                alt={showConfirmPassword ? "icon for displaying password" : "icon for hideing password"}  />
                    </button>
                </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
                className={`${mixins.submitBtn} ${styles.submitBtn}`}
                type="submit"
                disabled={!username || !email || !password || !confirmPassword}>
                    Register
            </button>
        </form>


        </section>
    );
}
