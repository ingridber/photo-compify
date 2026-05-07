import mixins from "../../styles/mixins.module.css";
import styles from "../../styles/manage-account.module.css";
import ImageUploadForm from "../images/ImageUploadForm";
import { DisplayProfilePicture } from "../display-profile-picture/DisplayProfilePicture";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router";
import { useState } from "react";
import { deleteProfilePicture } from "../../services/api";

export function ChangeProfilePicture(){
    const navigate = useNavigate();
    const { user, setUser} = useUser();
    const [openModal, setOpenModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDeleteProfilePicture= async () => {
        try {
            const res = await deleteProfilePicture();

            if(!res.ok) {
                throw new Error("Failed to delete profile picture");
            };

            setUser(prev => {
                if(!prev) return null;

                return {
                    ...prev,
                    profilePicture: null
                };
            });
        } catch (err){
            console.log('delete profile pic, changeProfilePicture.tsx : ', err);
        };

        setConfirmDelete(false);
    };

    return (
        <div className={mixins.sectionContainer}>
        {/* BACK BUTTON */}
            <button onClick={() => navigate(-1)} className={mixins.backBtn}>
                <img
                src="/arrow-left.svg"
                alt="icon of arrow pointing left"
                className={mixins.backBtnIcon}/>
            </button>

        {/* USER NAME & PROFILE PICTURE */}
            <p className={styles.username}>{user ? user.username : "USER"}</p>
            <div style={{ width: "7rem", margin: "auto" }}>
                <DisplayProfilePicture src={user?.profilePicture?.url} />
            </div>

            <button 
                className={styles.changePageBtn}
                onClick={() => setOpenModal(true)}>
                    {user?.profilePicture ? "Change " : "Upload "} Picture
            </button>

            {user?.profilePicture && (
                <>
                <article>
                    {!confirmDelete ? (
                    <button 
                        className={styles.changePageBtn}
                        onClick={() => setConfirmDelete(true)}>
                            Delete Picture
                    </button>
                    ) : (
                    <>
                    <p className={`${styles.signOutTitle} ${styles.space}`}>
                    {confirmDelete ? "Are you sure?" : "Need a break?"}
                    </p>
                    <div className={styles.confirmBtnContainer}>
                        <button
                        onClick={handleDeleteProfilePicture}
                        className={styles.confirmBtnYes}>
                            Yes
                        </button>
                        <button
                        onClick={() => setConfirmDelete(false)}
                        className={styles.confirmBtnNo}
                        >
                        No
                        </button>
                    </div>
                    </>
                    )}
                </article>
            </>
            )}

            {openModal && (
                <div className={styles.modalOverlay} onClick={() => setOpenModal(false)}>
                    <div 
                    className={styles.modalContent} 
                    onClick={(e) => e.stopPropagation()}>
                        <button 
                            className={styles.closeBtn}
                            onClick={() => setOpenModal(false)}>
                                ✕
                        </button>

                        <ImageUploadForm 
                            pictureType="profile"
                            onUploadSuccess={() => setOpenModal(false)}/>
                    </div>
                </div>
            )}
        </div>
    );
};