import styles from "./throbber.module.css";

type ThrobberProps = {
    message? : string | null;
    action? : string | null;
}

export function Throbber({message, action = 'Loading'}: ThrobberProps) {

    let displayMessage;
    const displayAction = action;

    if(message) displayMessage = message;

    return(
        < div className={styles.wrapper}>
            <div className={styles.throbberBackground}>
                <img src="/icons/throbber.svg" alt="loading icon" className={styles.throbberAnimation} />
            </div>

            {displayMessage && <p className={styles.message}>{displayMessage}</p>}
            <p className={styles.action}>{displayAction}</p>
        </div>
    )
}