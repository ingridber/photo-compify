import styles from "./displayProfilePicture.module.css";

type DisplayProfilePictureProps = {
    src? : string | null;
};


export function DisplayProfilePicture({src}: DisplayProfilePictureProps) {
    if(!src) {
        return (
            <div className={styles.profileBackground}>
                <img src="/user.svg" alt="Default avatar" className={styles.avatar}/>
            </div>
        );
    };
    
    return (
            <div className={styles.profileBackground}>
                <img src={src} alt="Profile picture" className={styles.picture} />
            </div>
        );
};


export function DisplayLogo() {
    return (
            <div className={styles.profileBackground}>
                <img src="/logo.png" alt="Profile picture" className={styles.logo}/>
            </div>
        );
};