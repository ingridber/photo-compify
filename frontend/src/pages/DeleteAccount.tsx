import mixins from "../styles/mixins.module.css";
import styles from "../styles/manage-account.module.css";
import { useNavigate } from "react-router";
import { useUser } from "../hooks/useUser";
import { useState, useEffect } from "react";
import { deleteAccount } from "../services/api";
import { Throbber } from "../components/user-feedback/Throbber";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";

export function DeleteAccount() {
    const navigate = useNavigate();
    const {user, setUser} = useUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [deleteCheck, setDeleteCheck] = useState("");
    const [message, setMessage] = useState("");
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (!user) {navigate("/");}
        setUsername(user?.username || 'User');
    }, [user, navigate]);

    const handleDeleteAccount = async () => {
        if (deleteCheck !== "DELETE") {
            setMessage('You must type "DELETE" to confirm');
            return;
        }

        if (!password) {
            setMessage("Password needed for confirmation");
            return;
        }

        try {
            const res = await deleteAccount(password);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to delete account");
            }

            setMessage(username ? `Account ${username} successfully deleted.` : 'Account successfully deleted');
            setRedirect(true);
            setTimeout(() => {
                navigate("/");
                setUser(null);
            }, 1500);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Something went wrong");
            }
        }
    };

    return (
        <div className={mixins.sectionContainer}>
            {redirect ? (
                <Throbber message={message} action="Redirecting..." />
            ) : (
            <>
            {/* BACK BUTTON */}
            <button onClick={() => navigate("/manage-account")} className={mixins.backBtn}>
                <img
                src="/arrow-left.svg"
                alt="icon of arrow pointing left"
                className={mixins.backBtnIcon}
                />
            </button>

            {/* USER */}
            <p className={styles.username}>{user ? user.username : "USER"}</p>

            <div style={{ width: "7rem", margin: "auto" }}>
                <DisplayProfilePicture src={user?.profilePicture?.url} />
            </div>

        
            <div className={styles.confirmContainer}>
            <p className={styles.deleteTitle}>Are you sure? No takesies backsies :-(</p>
              
              
            {/* TYPE DELTE TO CONFIRM  */}
            <div className={mixins.fieldGroup}>
                <label
                    htmlFor="confirm-delete"
                    className={mixins.labelForInput}>
                    Type DELETE to confirm
                </label>

                <div className={mixins.inputFieldContainer}>
                    <input
                    id="confirm-delete"
                    className={mixins.inputField}
                    type="text"
                    placeholder="Type DELETE to confirm"
                    value={deleteCheck}
                    onChange={(e) =>
                        setDeleteCheck(e.target.value)
                    }/>
                </div>
            </div>

            {/* CONFIRM PASSWORD  */}
            <div className={mixins.fieldGroup}>
                <label
                    htmlFor="password"
                    className={mixins.labelForInput}>
                    Current password
                </label>

                <div className={mixins.inputFieldContainer}>
                    <input
                        id="password"
                        className={mixins.inputField}
                        type={showPassword ? "text" : "password"}
                        placeholder="Current Password"
                        value={password}
                        onChange={(e) =>setPassword(e.target.value)}/>

                    <button
                        className={mixins.displayPasswordBtn}
                        type="button"
                        onClick={() =>setShowPassword((prev) => !prev)}>

                        <img 
                            className={mixins.displayPasswordBtnIcon}
                            src={showPassword ? "/eye-off.svg" : "/eye.svg"}
                            alt="toggle password visibility"/>
                    </button>
                </div>
            </div>

            <p>{message}</p>

            <div className={styles.confirmDeleteBtnContainer}>
                <button
                    onClick={() => {
                        navigate("/manage-account");
                        setPassword('')
                        setDeleteCheck('')}}
                    className={styles.confirmBtnStay}>
                        STAY
                </button>
                <button
                    onClick={handleDeleteAccount}
                    className={styles.confirmBtnBye}>
                        BYE
                </button>
            </div>
            </div>
            </>)}
        </div>
    )
}