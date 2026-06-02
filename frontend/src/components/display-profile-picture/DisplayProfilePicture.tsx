import styles from "./displayProfilePicture.module.css";

type DisplayProfilePictureProps = {
    src? : string | null;
};


export function DisplayProfilePicture({src}: DisplayProfilePictureProps) {
    if(!src) {
        return (
            <div className={styles.profileBackground}>
                <img src="/icons/user.svg" alt="Default avatar" className={styles.avatar}/>
            </div>
        );
    };
    
    return (
            <div className={styles.profileBackground}>
                <img src={src} alt="Profile picture" className={styles.picture} />
            </div>
        );
};