import styles from "../styles/sign-in.module.css";
import mixins from "../styles/mixins.module.css";
import { useState} from "react";
import { login } from "../services/api";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router";
import { DisplayProfilePicture } from "./display-profile-picture/DisplayProfilePicture";
import { Link } from "react-router";


interface FormErrors {
    username?: string;
    password?: string;
    general?: string;
    locked?: string;
}

export function SignInForm() {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const {setUser} = useUser();
    const navigate = useNavigate();


    const handleSubmit = async (e: React.SubmitEvent ) => {
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
                username: data.username,
                profilePicture: data.profilePicture || ''
                });

                setErrors({});
                setUsername('');
                setPassword('');
                setShowPassword(false);

                setMessage(`User: ${data.username} succesfully signed in. Redirecting...`);
                setRedirect(true);
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }

            if (res.status === 423) {
                setErrors({locked: data.message})
                // "Too many failed logins, try again in 1h"
                setPassword('');
            }

            if (res.status === 401) {
                setErrors({general: "Invalid credentials, username or password is incorrect" })
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
        <section className={mixins.sectionContainer}>

            {redirect 
            ? <p className={styles.redirect}>{message}</p> 
            : <>

            {/* BACK BUTTON */}
            <button 
                onClick={()=> navigate(-1)}
                className={mixins.backBtn}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={mixins.backBtnIcon} />
            </button>

            {/* TITLE & LOGO */}
            <p className={styles.title}>Sign in</p>
            <div style= {{width: "7rem", margin: "auto"}}>
                <DisplayProfilePicture src={'https://velvetescape.com/wp-content/uploads/2009/06/IMG_0136-1280x920.jpeg'} />
            </div>

            {/* LOGIN FORM  */}
            <form onSubmit={handleSubmit}>

            {/* FIELD GROUP: USERNAME */}
            <div className={mixins.fieldGroup}>

                {errors.username 
                    ? <p className={mixins.labelForInput} style={{ color: "red" }}>{errors.username}</p>
                    : <label htmlFor="username" className={mixins.labelForInput}>
                    Username</label>
                }
                
                <div className={mixins.inputFieldContainer}>
                    <input 
                        id="username"
                        className={mixins.inputField}
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required/>
                </div>
            </div>

            {/* FIELD GROUP: PASSWORD */}
            <div className={mixins.fieldGroup}>

                {errors.password 
                    ? <p className={mixins.labelForInput} style={{ color: "red" }}>{errors.password}</p>
                    : <label htmlFor="password" className={mixins.labelForInput}>
                    Password</label>
                }

                <div className={mixins.inputFieldContainer}>
                    <input 
                        id="password" 
                        className={mixins.inputField}
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}/>
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

            {/* UX MESSAGE */}
            {errors.general 
                ? <p className={mixins.errorMessage}>{errors.general}</p>
                : <></>}

            {errors.locked 
                ? <p className={mixins.errorMessage}>{errors.locked}</p>
                : <></>}

            {/* SUBMIT BUTTON */}
            <button
                className={`${mixins.submitBtn} ${styles.submitBtn}`}
                type="submit"
                disabled={!username || !password}>
                    Sign In
            </button>
            </form>

            <p className={styles.registerTitle}>Not a member?</p>
            <Link to="/register" className={styles.register}>
                Create an account
            </Link>
            </>
            }
        </section>
    )
};