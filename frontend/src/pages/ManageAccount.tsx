import mixins from "../styles/mixins.module.css";
import styles from "../styles/manage-account.module.css";
import { Link, useNavigate } from "react-router";
import { useUser } from "../hooks/useUser";
import { useState } from "react";

import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { logout } from "../services/api";

export function ManageAccount() {
    const navigate = useNavigate();
    const {user, setUser} = useUser();
    const [confirmSignOut, setConfirmSignOut] = useState(false);
    const [message, setMessage] = useState('');
    const [redirect, setRedirect] = useState(false);

    const handleSignOut = async () => {
        try {
            await logout();

            setMessage(`User: ${user?.username} succesfully logged out. Redirecting...`);
            setRedirect(true);
            setUser(null);
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err: unknown) {
            if(err instanceof Error) {
                setMessage(err.message)
            } else {
                setMessage('Something went wrong')
            }
        };
    };

    return(
        <div className={mixins.sectionContainer}>

            {redirect 
            ? <p>{message}</p> 
            : <>
                
            {/* BACK BUTTON */}
            <button 
                onClick={()=> navigate(-1)}
                className={mixins.backBtn}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={mixins.backBtnIcon} />
            </button>

            {/* USER NAME & PROFILE PICTURE */}
            <p className={styles.username}>{user? user.username : "USER"}</p>
            <div style= {{width: "7rem", margin: "auto"}}>
                <DisplayProfilePicture src={user?.profilePicture} />
            </div>

            <Link to="change-picture" className={styles.changeProfilePicLink}>
                {user?.profilePicture ? "Change " : "Upload "}Profile Picture
            </Link>

            {/* UPDATE BUTTONS */}
            <Link to="change-username" className={styles.changePageBtn}>
                Change Username
            </Link>

            <Link to="change-password" className={styles.changePageBtn}>
                Change Password
            </Link>

            {/* SIGN OUT */}
            <article>
                <p className={`${styles.signOutTitle} ${styles.space}`}>
                    {confirmSignOut ? "Are you sure?" : "Need a break?"}
                </p>

                {!confirmSignOut ? (
                    <button
                        onClick={() => setConfirmSignOut(true)}
                        className={styles.signOut}>
                            Sign Out
                    </button>
                ):(
                    <div className={styles.confirmBtnContainer
                    }>
                        <button
                            onClick={handleSignOut}
                            className={styles.confirmBtnYes}>
                                Yes
                        </button>
                        <button
                            onClick={() => setConfirmSignOut(false)}
                            className={styles.confirmBtnNo}>
                                No
                        </button>
                    </div>
                )}
            </article>

            {/* DELETE ACCOUNT  */}
            <article>
                <p className={styles.deleteAccountTitle}>
                    Wanna break up? :-(</p>
                <Link to="delete-account" className={styles.deleteAccount}>
                    Delete Account
                </Link>
            </article>
            </>
            }
        </div>    
    )
};