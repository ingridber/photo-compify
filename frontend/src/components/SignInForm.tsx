import styles from "../styles/sign-in.module.css";
import mixins from "../styles/mixins.module.css";
import { useState} from "react";
import { login } from "../services/api";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router";
import { DisplayProfilePicture } from "./display-profile-picture/DisplayProfilePicture";

export function SignInForm() {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState('');
    const {user, setUser} = useUser();
    const navigate = useNavigate();


    const handleSubmit = async (e: React.SubmitEvent ) => {
        e.preventDefault();

        try {
            const data = await login(username, password);
            setMessage(data.message);
            setUser({
                username: data.username,
                profilePicture: data.profilePicture || ''
            });
            setUsername('');
            setPassword('');
            setShowPassword(false);

        } catch (err) {
            setUser(null);
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage('Something went wrong');
            }
        };
    };

    return (
        <section className={mixins.sectionContainer}>

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
                <label htmlFor="username" className={mixins.labelForInput}>
                    Username</label>

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

                <label 
                    htmlFor="password" 
                    className={mixins.labelForInput}>
                        Password</label>

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
            {message && 
                <p className={mixins.message}>{message}</p>
            }

            {/* SUBMIT BUTTON */}
            <button
                className={`${mixins.submitBtn} ${styles.submitBtn}`}
                type="submit"
                disabled={!username || !password}>
                    Sign In
            </button>
            </form>

            {user && <p>Welcome {user.username}</p>}
        </section>
    )
};