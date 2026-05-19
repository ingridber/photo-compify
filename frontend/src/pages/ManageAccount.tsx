import mixins from "../styles/mixins.module.css";
import styles from "../styles/manage-account.module.css";
import { Link, useNavigate } from "react-router";
import { useUser } from "../hooks/useUser";
import { useState } from "react";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";

export function ManageAccount() {
  const navigate = useNavigate();
  const { user} = useUser();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <div>
      {/* HEADER CONTAINER */}
      <section className={mixins.headerContainer}>
        {/* USERNAME & PROFILE PICTURE */}
        <p className={mixins.username}>{user ? user.username : "USER"}</p>
        <div style={{ width: "7rem", margin: "auto" }}>
          <DisplayProfilePicture src={user?.profilePicture?.url} />
        </div>
      </section>

      {/* CONTENT CONTAINER */}
      <div className={mixins.contentContainer}>


      <Link to="change-picture" className={styles.changeProfilePicLink}>
        {user?.profilePicture ? "Change " : "Upload "}Profile Picture
      </Link>

      <Link to="change-username" className={styles.changePageLink}>
        Change Username
      </Link>

      <Link to="change-password" className={styles.changePageLink}>
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
            className={styles.signOut}
          >
            Sign Out
          </button>
        ) : (
          <div className={styles.confirmBtnContainer}>
            <button
              onClick={() => navigate("/logout")}
              className={styles.confirmBtnYes}>
                Yes
              </button>
            <button
              onClick={() => setConfirmSignOut(false)}
              className={styles.confirmBtnNo}
            >
              No
            </button>
          </div>
        )}
      </article>

      {/* DELETE ACCOUNT  */}
      <article>
        <p className={`${styles.deleteAccountTitle}`}> Wanna break up? :-(</p>

        <button
          onClick={() => navigate("/delete-account")}
          className={styles.deleteAccount}>
            Delete Account
        </button>
      </article>
    </div>

    </div>
  );
};