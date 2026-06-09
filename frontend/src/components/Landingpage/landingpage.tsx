import styles from "./landingpage.module.css";
import { useNavigate } from "react-router";
import { useUser } from "../../hooks/useUser";

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useUser();

    return (
        <main className={styles.container}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Capture.
                        <br />
                        Compete.
                        <br />
                        Inspire.
                    </h1>

                    <p className={styles.heroText}>Join photographers from around the world. Enter competitions, showcase your vision, and get discovered.</p>

                    <div className={styles.heroActions}>
                        <button
                            onClick={() => navigate("/competitions")}
                            className={styles.primaryBtn}
                        >
                            Explore Competitions
                        </button>

                        {user ? (
                            <button
                                onClick={() => navigate("/create-competition")}
                                className={styles.secondaryBtn}
                            >
                                Create Competition
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/login")}
                                className={styles.secondaryBtn}
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.heroBackground}>
                    <div className={styles.overlay} />
                </div>
            </section>
        </main>
    );
}
