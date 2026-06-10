import styles from "./landingpage.module.css";
import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router";
import { useUser } from "../../hooks/useUser";
import { getFeaturedComps } from "../../services/competitions.ts";
import CompetitionsCard from "../competitions/CompetitionsCard";
import FeaturedSlider from "./FeaturedSlider";
import type { Competition } from "../../types/competitions";

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp: T = array[i] as T;
        array[i] = array[j] as T;
        array[j] = temp;
    }
    return array;
}

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [competitions, setCompetitions] = useState<Competition[]>([]);

    useEffect(() => {
        async function loadFeatured() {
            try {const result = await getFeaturedComps();
                setCompetitions([...result.submissionCompetitions, ...result.votingCompetitions]);
            } catch (error) {
                console.error(error);
            }
        }
        loadFeatured();
    }, []);

    const shuffledArray = shuffleArray(competitions);

    return (
        // HERO
        <main className={styles.container}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Capture.<br />Compete.<br />Inspire.</h1>
                    <p className={styles.heroText}>Join photographers from around the world. Enter competitions, showcase your vision, and get discovered.</p>
                    <div className={styles.heroActions}>
                        <button onClick={() => navigate("/competitions")} className={styles.primaryBtn}>
                            Explore Competitions
                        </button>
                        {user ? (
                            <button onClick={() => navigate("/create-competition")} className={styles.secondaryBtn}>
                                Create Competition
                            </button>
                            ) : (
                            <button onClick={() => navigate("/login")} className={styles.secondaryBtn}>
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
                <div className={styles.heroBackground}>
                    <div className={styles.overlay} />
                </div>
            </section>

            {/* SLIDER */}
            <div className={`${styles.sliderTitleContainer}`}>
                <h2 className={`${styles.sliderTitle}`}>Popular Competitions</h2>
            </div>
            <section className={styles.sliderSection}>
                {shuffledArray.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>OH NO... </p>
                        <p>There's no competitions in the submission phase.... yet...?</p>
                        <p>Press the button and create a competition</p>
                        <NavLink to="/create-competition" className={styles.emptyBtn}>Create Competition</NavLink>
                    </div>
                ) : (
                    <FeaturedSlider autoplayDelay={6500}>
                        {shuffledArray.map((competition) => (
                            <CompetitionsCard key={competition._id} competition={competition}/>
                        ))}
                    </FeaturedSlider>
                )}
            </section>
        </main>
    );
}