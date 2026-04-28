import styles from "./change.module.css";
import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router";
import { updatePassword } from "../../services/api";

export function ChangePassword() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {user} = useUser();
    const navigate = useNavigate();
    const [message, setMessage] = useState(''); 



    const handleUpdatePassword = async (e:React.SubmitEvent) => {
        e.preventDefault();

        try {
            const data = await updatePassword(password, newPassword, confirmPassword);
            setMessage(data.message || "Password updated successfully");
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(err.message)
            } else {
                setMessage('Something went wrong in API updatePassword')
            }
        };

    }

    return (
        <section>
            <button onClick={()=> navigate(-1)}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={styles.back} />
            </button>

            <div><p>PIC HERE</p></div>
            <p>{user?.username}</p>

            <h3>Change Password</h3>
            <form onSubmit={handleUpdatePassword}>

                <label htmlFor="password">Enter old password</label>
                <br /> {/* !!!!! TA BORT SEN !!!!! */}

                <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Old Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}/>
                <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}>
                        <img
                            className={styles.icon}
                            src={showPassword ? "/eye-off.svg" : "/eye.svg"} 
                            alt={showPassword ? "icon for displaying password" : "icon for hideing password"}  />
                </button>
    
                <br /> {/* !!!!! TA BORT SEN !!!!! */}

                <label htmlFor="newPassword">Enter new password</label>
                <br /> {/* !!!!! TA BORT SEN !!!!! */}

                <input 
                    id="newPassword" 
                    type={showNewPassword ? "text" : "password"}  
                    placeholder="New password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} />
                <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}>
                        <img
                            className={styles.icon}
                            src={showNewPassword ? "/eye-off.svg" : "/eye.svg"} 
                            alt={showNewPassword ? "icon for displaying password" : "icon for hideing password"}  />
                </button>

                <br /> {/* !!!!! TA BORT SEN !!!!! */}


                <label htmlFor="confirmPassword">Confirm password</label>
                <br /> {/* !!!!! TA BORT SEN !!!!! */}

                <input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm new password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}>
                        <img
                            className={styles.icon}
                            src={showConfirmPassword ? "/eye-off.svg" : "/eye.svg"} 
                            alt={showConfirmPassword ? "icon for displaying password" : "icon for hideing password"}  />
                </button>

                <br /> {/* !!!!! TA BORT SEN !!!!! */}

                <button 
                    type="submit" 
                    disabled={!password || !newPassword || !confirmPassword} >
                        Update Password
                </button>

            </form>

            {message && <p>{message}</p>}

        </section>
    )
}