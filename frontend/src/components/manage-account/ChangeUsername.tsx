import mixins from "../../styles/mixins.module.css";
import { useState } from "react";
import { updateUsername } from "../../services/api";
import { useNavigate } from "react-router";
import { useUser } from "../../hooks/useUser";
import { DisplayProfilePicture } from "../display-profile-picture/DisplayProfilePicture";

export function ChangeUsername() {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const {user, setUser} = useUser();

    const navigate = useNavigate();

    const handleUpdateUsername = async (e: React.SubmitEvent) => {
        e.preventDefault();

        try {
            const data = await updateUsername(username);
            setUser(prev => prev ? {...prev, username: data.username} : null);
            setMessage(data.message || "Username updated successfully")
            setUsername('');
        } catch (err: unknown) {
            if(err instanceof Error) {
                setMessage(err.message)
            } else {
                setMessage('Something went wrong')
            }
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

            {/* PROFILE PICTURE & USER NAME */}
            <div style= {{width: "7rem", margin: "auto"}}>
                <DisplayProfilePicture src={user?.profilePicture?.url} />
            </div>
            <p className={mixins.username}>{user? user.username : "USER"}</p>

            {/* CHANGE PASSWORD FORM  */}
            <form onSubmit={handleUpdateUsername}>

            {/* FIELD GROUP: NEW USERNAME */}
            <div className={mixins.fieldGroup}>

                <label htmlFor="username" className={mixins.labelForInput}>
                    New username</label>

                <div className={mixins.inputFieldContainer}>
                    <input 
                        id="username"
                        className={mixins.inputField}
                        required
                        type="text" 
                        placeholder="New username" 
                        value={username} 
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setMessage('')
                        }}/>
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
                disabled={!username}>
                    <img src="/check.svg" alt="icon of arrow pointing left" className={mixins.submitBtnIcon} />
            </button>

            </form>
        </section>
    );
};