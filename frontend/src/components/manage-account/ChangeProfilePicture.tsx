import mixins from "../../styles/mixins.module.css";
import styles from "../../styles/manage-account.module.css";

import ImageUploadForm from "../images/ImageUploadForm";
import { DisplayProfilePicture } from "../display-profile-picture/DisplayProfilePicture";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router";
import { useState } from "react";


export function ChangeProfilePicture(){

    const navigate = useNavigate();
    const { user} = useUser();
    const [openModal, setOpenModal] = useState(false);


    return (

        <div className={mixins.sectionContainer}>
        {/* BACK BUTTON */}
            <button onClick={() => navigate(-1)} className={mixins.backBtn}>
                <img
                src="/arrow-left.svg"
                alt="icon of arrow pointing left"
                className={mixins.backBtnIcon}
                />
            </button>

        {/* USER NAME & PROFILE PICTURE */}
            <p className={styles.username}>{user ? user.username : "USER"}</p>
            <div style={{ width: "7rem", margin: "auto" }}>
                <DisplayProfilePicture src={user?.profilePicture} />
            </div>


            <button 
                className={styles.changePageBtn}
                onClick={() => setOpenModal(true)}>
                    {user?.profilePicture ? "Change " : "Upload "}Profile Picture
            </button>

            {openModal && (
                <div className={styles.modalOverlay} onClick={() => setOpenModal(false)}>
                    <div 
                    className={styles.modalContent} 
                    onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className={styles.closeBtn}
                            onClick={() => setOpenModal(false)}
                        >
                            ✕
                        </button>

                        <ImageUploadForm 
                            pictureType="profile"
                            onUploadSuccess={() => setOpenModal(false)}/>
                    </div>
                </div>

            )}


        </div>
    )
}