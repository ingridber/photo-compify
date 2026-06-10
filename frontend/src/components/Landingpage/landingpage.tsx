import styles from "./landingpage.module.css";
import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router";
import { useUser } from "../../hooks/useUser";
import { getFeaturedComps } from "../../services/api";
import CompetitionsCard from "../competitions/CompetitionsCard";
import FeaturedSlider from "./FeaturedSlider";
import type { Competition } from "../../types/competitions";

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [submissionCompetitions, setSubmissionCompetitions] = useState<Competition[]>([]);
    const [votingCompetitions, setVotingCompetitions] = useState<Competition[]>([]);

    useEffect(() => {
        async function loadFeatured() {
            try {const result = await getFeaturedComps();
                setVotingCompetitions(result.votingCompetitions);
                setSubmissionCompetitions(result.submissionCompetitions);
            } catch (error) {
                console.error(error);
            }
        }
        loadFeatured();
    }, []);

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

            {/* SLIDER - VOTING */}
            <section className={styles.sliderSection}>
                <div className={styles.sliderTitleContainer}>
                    <h2 className={styles.sliderTitle}>Voting Now</h2>
                </div>
                {votingCompetitions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>SAY WHAT!? </p>
                        <p>There's no competitions in the voting phase?</p>
                        <p>Oh well, you might aswell explore</p>
                        <NavLink to="/competitions" className={styles.emptyBtn}>Explore Competitions</NavLink>
                    </div>
                ) : (
                    <FeaturedSlider>
                        {votingCompetitions.map((competition) => (
                            <CompetitionsCard key={competition._id} competition={competition}/>
                        ))}
                    </FeaturedSlider> 
                )}
            </section>
            {/* SLIDER - COMPETITION */}
            <section className={styles.sliderSection}>
                <div className={`${styles.sliderTitleContainer} ${styles.sliderSpace}`}>
                    <h2 className={`${styles.sliderTitle} ${styles.sliderTitleComp}`}>Popular Competitions</h2>
                </div>
                {submissionCompetitions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>OH NO... </p>
                        <p>There's no competitions in the submission phase.... yet...?</p>
                        <p>Press the button and create a competition</p>
                        <NavLink to="/create-competition" className={styles.emptyBtn}>Create Competition</NavLink>
                    </div>
                ) : (
                    <FeaturedSlider autoplayDelay={6500}>
                        {submissionCompetitions.map((competition) => (
                            <CompetitionsCard key={competition._id} competition={competition}/>
                        ))}
                    </FeaturedSlider>
                )}
            </section>
        </main>
    );
}