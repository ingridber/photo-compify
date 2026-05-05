import mixins from "../styles/mixins.module.css";
import styles from "../styles/manage-account.module.css";
import { Link, useNavigate } from "react-router";
import { useUser } from "../hooks/useUser";
import { useState } from "react";

import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { logout, deleteAccount } from "../services/api";
import { Throbber } from "../components/user-feedback/Throbber";

export function ManageAccount() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteCheck, setDeleteCheck] = useState("");
  const [finalWarning, setFinalWarning] = useState(false);

  // HANDLE SIGN OUT
  const handleSignOut = async () => {
    try {
      await logout();

      setMessage(`${user?.username} succesfully signed out`);
      setRedirect(true);

      setTimeout(() => {
        navigate("/");
        setUser(null);
      }, 1800);
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Something went wrong");
    }
  };

  // VALIDATION STEP
  const handleDeleteAccountValidation = () => {
    if (deleteCheck !== "DELETE") {
      setMessage('You must type "DELETE" to confirm');
      return;
    }

    if (!password) {
      setMessage("Password needed for confirmation");
      return;
    }

    setFinalWarning(true);
  };

  // FINAL DELETE
  const handleDeleteAccount = async () => {
    try {
      const res = await deleteAccount(password);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      setMessage("Account successfully deleted.");
      setRedirect(true);

      setTimeout(() => {
        navigate("/");
        setUser(null);
      }, 1500);
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Something went wrong");
    }
  };

  // HANDLE STAY
  const handleStay = () => {
    setFinalWarning(false);
    setConfirmDelete(false);
    setPassword('');
    setShowPassword(false);
    setDeleteCheck('');
  }

  return (
    <div className={mixins.sectionContainer}>
      {redirect ? (
        <Throbber message={message} action="Redirecting..." />
      ) : (
        <>
          {/* BACK BUTTON */}
          <button onClick={() => navigate(-1)} className={mixins.backBtn}>
            <img
              src="/arrow-left.svg"
              alt="icon of arrow pointing left"
              className={mixins.backBtnIcon}
            />
          </button>

          {/* USER */}
          <p className={styles.username}>{user ? user.username : "USER"}</p>

          <div style={{ width: "7rem", margin: "auto" }}>
            <DisplayProfilePicture src={user?.profilePicture} />
          </div>

          <Link to="change-picture" className={styles.changeProfilePicLink}>
            {user?.profilePicture ? "Change " : "Upload "}Profile Picture
          </Link>

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
                className={styles.signOut}
              >
                Sign Out
              </button>
            ) : (
              <div className={styles.confirmBtnContainer}>
                <button
                  onClick={handleSignOut}
                  className={styles.confirmBtnYes}
                >
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

          {/* DELETE ACCOUNT */}
          <article>
            <p className={styles.deleteAccountTitle}>
              Wanna break up? :-(
            </p>

            <button
              onClick={() => setConfirmDelete(true)}
              className={styles.deleteAccount}
            >
              Delete Account
            </button>

            {confirmDelete && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  {!finalWarning ? (
                    <>
                      <p className={styles.deleteTitle}>
                        TERMINATION OF USER: 
                        {user ? ` ${user.username.toUpperCase()}` : "USER"}
                      </p>

                      <div className={mixins.fieldGroup}>
                        <label
                          htmlFor="confirm-delete"
                          className={mixins.labelForInput}
                        >
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
                            }
                          />
                        </div>
                      </div>

                      <div className={mixins.fieldGroup}>
                        <label
                          htmlFor="password"
                          className={mixins.labelForInput}
                        >
                          Current password
                        </label>

                        <div className={mixins.inputFieldContainer}>
                          <input
                            id="password"
                            className={mixins.inputField}
                            type={showPassword ? "text" : "password"}
                            placeholder="Current Password"
                            value={password}
                            onChange={(e) =>
                              setPassword(e.target.value)
                            }
                          />

                          <button
                            className={mixins.displayPasswordBtn}
                            type="button"
                            onClick={() =>
                              setShowPassword((prev) => !prev)
                            }
                          >
                            <img
                              className={
                                mixins.displayPasswordBtnIcon
                              }
                              src={
                                showPassword
                                  ? "/eye-off.svg"
                                  : "/eye.svg"
                              }
                              alt="toggle password visibility"
                            />
                          </button>
                        </div>
                      </div>

                      <p>{message}</p>

                      <div
                        className={
                          styles.confirmDeleteBtnContainer
                        }
                      >
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className={styles.confirmBtnStay}
                        >
                          STAY
                        </button>

                        <button
                          onClick={handleDeleteAccountValidation}
                          className={styles.confirmBtnBye}
                        >
                          BYE
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={styles.deleteTitle}>
                        Are you sure? No takesies backsies :-(
                      </p>

                      <div
                        className={
                          styles.confirmDeleteBtnContainer
                        }
                      >
                        <button
                          onClick={handleStay}
                          className={styles.confirmBtnYes}
                        >
                          NO
                        </button>

                        <button
                          onClick={handleDeleteAccount}
                          className={styles.confirmBtnNo}
                        >
                          YES
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </article>
        </>
      )}
    </div>
  );
}