import mixins from "../../styles/mixins.module.css";
import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router";
import { updatePassword } from "../../services/api";
import { DisplayProfilePicture } from "../display-profile-picture/DisplayProfilePicture";


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

        if(password === newPassword) {
        setMessage("New password must be different from the old password.");
        return;
        }

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
        <section className={mixins.sectionContainer}>

            {/* BACK BUTTON */}
            <button 
                onClick={()=> navigate(-1)}
                className={mixins.backBtn}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={mixins.backBtnIcon} />
            </button>

            {/* PROFILE PICTURE & USER NAME */}
            <div style= {{width: "7rem", margin: "auto"}}>
                <DisplayProfilePicture src={user?.profilePicture?.url} />
            </div>
            <p className={mixins.username}>{user? user.username : "USER"}</p>

            {/* CHANGE PASSWORD FORM  */}
            <form onSubmit={handleUpdatePassword}>

            {/* FIELD GROUP: CURRENT PASSWORD */}
            <div className={mixins.fieldGroup}>

                <label 
                    htmlFor="password" 
                    className={mixins.labelForInput}>
                        Current password</label>

                <div className={mixins.inputFieldContainer}>
                    <input 
                        id="password" 
                        className={mixins.inputField}
                        type={showPassword ? "text" : "password"} 
                        placeholder="Current Password" 
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

            {/* FIELD GROUP: NEW PASSWORD */}
            <div className={mixins.fieldGroup}>

                <label 
                    htmlFor="newPassword" 
                    className={mixins.labelForInput}>
                        New password</label>

                <div className={mixins.inputFieldContainer}>
                    <input 
                        id="newPassword"
                        className={mixins.inputField}
                        type={showNewPassword ? "text" : "password"}  
                        placeholder="New password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} />
                    <button 
                        className={mixins.displayPasswordBtn}
                        type="button"
                        onClick={() => setShowNewPassword(prev => !prev)}>
                        <img
                            className={mixins.displayPasswordBtnIcon}
                            src={showNewPassword ? "/eye-off.svg" : "/eye.svg"} 
                            alt={showNewPassword ? "icon for displaying password" : "icon for hideing password"}  />
                    </button>
                </div>
            </div>

            {/* FIELD GROUP: CONFIRM PASSWORD */}
            <div className={mixins.fieldGroup}>
                
                <label 
                    htmlFor="confirmPassword"
                    className={mixins.labelForInput}>
                        Confirm password</label>

                <div className={mixins.inputFieldContainer}> 
                    <input 
                        id="confirmPassword"
                        className={mixins.inputField}
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Confirm password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} />
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

            {/* UX MESSAGE */}
            {message && 
                <p className={mixins.message}>{message}</p>
            }

            {/* SUBMIT BUTTON */}
            <button 
                className={mixins.submitBtn}
                type="submit" 
                disabled={!password || !newPassword || !confirmPassword} >
                    <img src="/check.svg" alt="icon of arrow pointing left" className={mixins.submitBtnIcon} />
            </button>

            </form>
        </section>
    );
};