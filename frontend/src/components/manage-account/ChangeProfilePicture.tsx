import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { deleteProfilePicture } from "../../services/api";
import ImageUploadForm from "../images/ImageUploadForm";

import styles from "../../styles/form.module.css";
import modalStyles from "../../styles/upload-overlay.module.css";

export function ChangeProfilePicture() {
    const { user, setUser } = useUser();

    const [openModal, setOpenModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDeleteProfilePicture = async () => {
        try {
            const res = await deleteProfilePicture();

            if (!res.ok) {
                throw new Error(
                    "Failed to delete profile picture"
                );
            }

            setUser((prev) => {
                if (!prev) return null;

                return {
                    ...prev,
                    profilePicture: null,
                };
            });
        } catch (err) {
            console.log(
                "delete profile picture:",
                err
            );
        }

        setConfirmDelete(false);
    };

    return (
        <>
            <section className={styles.changePanel}>
                <h1 className={styles.title}>Profile Picture</h1>

                <div className={styles.actions}>
                    <button
                        className={styles.saveBtn}
                        onClick={() => setOpenModal(true)}
                    >
                        {user?.profilePicture
                            ? "Change Picture"
                            : "Upload Picture"}
                    </button>
                </div>

                {user?.profilePicture && (
                    <>
                        {!confirmDelete ? (
                            <div
                                className={styles.actions}
                                style={{marginTop: "1rem",}}
                            >
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => setConfirmDelete(true)}
                                >
                                    Delete Picture
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className={styles.warningText}>Are you sure you want to remove your profile picture?</p>

                                <div className={styles.buttonContainer}>
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={() => setConfirmDelete(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className={styles.deleteBtn}
                                        onClick={handleDeleteProfilePicture}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </section>

            {openModal && (
                <div
                    className={modalStyles.modalOverlay}
                    onClick={() => setOpenModal(false)}
                >
                    <div
                        className={modalStyles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={modalStyles.closeBtn}
                            onClick={() => setOpenModal(false)}
                        >
                            ✕
                        </button>

                        <ImageUploadForm
                            pictureType="profile"
                            onUploadSuccess={() => setOpenModal(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}