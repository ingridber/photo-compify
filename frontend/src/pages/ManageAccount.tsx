import mixins from "../styles/mixins.module.css";
import styles from "../styles/manage-account.module.css";
import { Link } from "react-router";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router";

import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";

export function ManageAccount() {

    const {user} = useUser();
    const navigate = useNavigate();

    return(
        <div className={mixins.sectionContainer}>
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
                    Need a break?</p>
                <Link to="sign-out" className={styles.signOut}>
                    Sign Out
                </Link>
            </article>


            {/* DELETE ACCOUNT  */}

            <article>
                <p className={styles.deleteAccountTitle}>
                    Wanna break up? :-(</p>
                <Link to="delete-account" className={styles.deleteAccount}>
                    Delete Account
                </Link>
            </article>

            

        </div>    
    )
}