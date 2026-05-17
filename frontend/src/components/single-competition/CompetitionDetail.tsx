import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchCompetitionById } from "../../services/api";
import { type Competition, type Phase, type Indicator, type Submission } from "../../types/competitions.ts";
import SubmissionCard from "./SubmissionCard";
import SubmissionExpanded from "./SubmissionExpanded.tsx";
import styles from "./CompetitionDetail.module.css";
import { useUser } from "../../hooks/useUser.ts";
import mixins from "../../styles/mixins.module.css";
import { Throbber } from "../user-feedback/Throbber.tsx";

function getPhase(comp: Competition): Phase {
    const now = Date.now();
    const votingStart = new Date(comp.votingStartDate).getTime();
    const end = new Date(comp.endDate).getTime();

    if (now < votingStart) return "submission";
    if (now < end) return "voting";
    return "finished";
}

function formatCountdown(target: string): string {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return "0m";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days >= 2) return `${days}d`;
    if (days >= 1) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m`;
}

function getIndicator(
    submission: Submission,
    phase: Phase,
    rank: number,
    userId?: string,
): Indicator {
    if (!submission) return "none";
    if (phase === "voting" && userId) {
        return submission.votes?.includes(userId) ? "voted" : "none";
    }

    if (phase === "finished") {
        if (rank === 0) return "gold";
        if (rank === 1) return "silver";
        if (rank === 2) return "bronze";
    }

    return "none";
}

function sortSubmissions(
    submissions: Submission[],
    phase: Phase,
    userId?: string,
): Submission[] {
    if (phase === "submission" && userId) return [...submissions].filter(s => s.user._id === userId);
    if (phase === "voting" && userId) {
        return [...submissions].sort(
            (a, b) =>
                (b.votes?.includes(userId) ? 1 : 0) -
                (a.votes?.includes(userId) ? 1 : 0),
        );
    }

    if (phase === "finished") {
        return [...submissions].sort(
            (a, b) => (b.votes.length ?? 0) - (a.votes.length ?? 0),
        );
    }

    return submissions;
}

export default function CompetitionDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const loadCompetition = useCallback(() => {
        if (!id) return;

        setLoading(true);
        fetchCompetitionById(id)
            .then(setCompetition)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        loadCompetition();
    }, [loadCompetition]);


    if (loading) return <Throbber/>;
    if (error) return <p>{error}</p>;
    if (!competition) return <p>Competition not found</p>;
    const phase = getPhase(competition);

    const sorted = sortSubmissions(competition.submissions, phase, user?._id);
    const userSubmission = competition.submissions.find((s) => {
        if (!s.user) return;
        const userId = typeof s.user === "string" ? s.user : s.user._id;
        return userId === user?._id;
    });

    const countdownTarget =
        phase === "submission"
            ? competition.votingStartDate
            : competition.endDate;

    function handleVoteChange() {
        setSelectedSubmission(null);
        loadCompetition();
    }

    return (
    <div className={styles.container}>

        {/* ----- HEADER: Navigate btn, Logo, Title----- */}
        <div className={styles.header}> 

            {/* NAVIGATE BACK BTN */}
            <button 
                onClick={()=> navigate("/competitions")}
                className={styles.backBtn}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={mixins.backBtnIcon} />
            </button>

            {/* LOGO */}
                <div className={styles.logoContainer}>
                {competition.logoBanner ? (
                    // LOGO PIC
                    <img
                    src={competition.logoBanner}
                    alt={`${competition.title} logo`}
                    className={styles.logoPic}/>
                ) : (
                    // NO LOGO TEXT
                    <img
                    src="/competitions.svg"
                    alt={`Competition icon`}
                    className={styles.noLogo}/>
                )}
                </div>
                {competition.owner && user?.username === competition.owner.username ? <p>Upload Logo?</p> : ""}


                {/* TITLE */}
                <h1 className={styles.title}>{competition.title}</h1>

                {/* OWNER */}
                {<p className={styles.owner}>By: {competition.owner?.username}</p>}

        </div>

        {/* ----- INFORMATIVE: Themes & Description ----- */}
        <div className={styles.informative}> 

            {/* THEMES CONTAINER  */}
            <div className={styles.themesContainer}>
                {(competition.themes ?? []).map((theme) => (
                    // THEME 
                    <span className={styles.theme}
                    key={theme}>
                        {theme}
                    </span>
                ))}
            </div>

            {/* DESCRIPTION */}
            <p className={styles.descriptionTitle}>Description</p>
            <p className={styles.description}>{competition.description}</p>
        </div>

        {/* ----- STATS ----- */}

        <div className={styles.stats}>
                {phase === "finished" && (
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Host</span>
                        <span className={styles.statValue}>
                            {competition.owner.username}
                        </span>
                    </div>
                )}

                <div className={styles.stat}>
                    <span className={styles.statLabel}>Participants</span>
                    <span className={styles.statValue}>
                        {competition.submissions.length}
                    </span>
                </div>

                {phase === "submission" && (
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Voting begins</span>
                        <span className={styles.statValue}>
                            {formatCountdown(countdownTarget)}
                        </span>
                    </div>
                )}

                {phase === "voting" && (
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Ends in</span>
                        <span className={styles.statValue}>
                            {formatCountdown(countdownTarget)}
                        </span>
                    </div>
                )}

                {phase === "finished" && sorted.length > 0 && (
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Winner</span>
                        <span className={styles.statValue}>
                            {sorted[0].user.username}
                        </span>
                    </div>
                )}
            </div>

            {/* ----- SUBMIT & SUBMISSIONS ----- */}

            {phase === "submission" && !userSubmission && (
                <div className={styles.cta}>
                    <p className={styles.ctaTitle}>Want to participate?</p>
                    
                    <button
                        className={mixins.uploadSubmit}
                        type="button"
                        onClick={() => navigate(`/competitions/${id}/submit`)}
                    >
                        <img src="/submit-upload.svg" alt="icon upload image" className={mixins.uploadSubmitIcon}/>
                    </button>
                    <p className={styles.ctaSubtext}>
                        Submit your entry before voting begins
                    </p>
                </div>
            )}

            {phase === "submission" && userSubmission && (
                <div className={styles.cta}>
                    {userSubmission.signedImageUrl && (
                        <img
                            className={styles.ctaImage}
                            src={userSubmission.signedImageUrl}
                            alt="Your submission"
                        />
                    )}
                    <p className={styles.ctaTitle}>You have submitted!</p>
                    
                    <button
                        className={mixins.editSubmit}
                        type="button"
                        onClick={() => navigate(`/competitions/${id}/submit`)}
                    >
                        <img src="/submit-edit.svg" alt="icon upload image" className={mixins.editSubmitIcon}/>
                    </button>
                    <p className={styles.ctaSubtext}>
                        Edit your submission?
                    </p>
                </div>
            )}

            {(phase === "voting" || phase === "finished") && (
                <div className={styles.gridWrapper}>
                    {selectedSubmission ? (
                        <SubmissionExpanded
                            submission={selectedSubmission}
                            phase={phase}
                            userId={user?._id}
                            onClose={() => setSelectedSubmission(null)}
                            onVoteChange={handleVoteChange}
                        />
                    ) : (
                        <div className={styles.grid}>
                            {sorted.map((sub, i) => (
                                <SubmissionCard
                                    key={sub._id ?? i}
                                    submission={sub}
                                    indicator={getIndicator(sub, phase, i, user?._id)}
                                    onClick={() => setSelectedSubmission(sub)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
