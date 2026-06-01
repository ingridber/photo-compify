import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchCompetitionById } from "../../services/api";
import { type Competition, type Phase, type Submission } from "../../types/competitions.ts";
import SubmissionExpanded from "./SubmissionExpanded.tsx";
import styles from "./CompetitionDetail.module.css";
import { useUser } from "../../hooks/useUser.ts";
import mixins from "../../styles/mixins.module.css";
import { Throbber } from "../user-feedback/Throbber.tsx";
import ImageUploadForm from "../images/ImageUploadForm.tsx";
import { getIndicator, sortSubmissions } from "../../utils/submissionIndicators.ts";

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

export default function CompetitionDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showLogoModal, setShowLogoModal] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);


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


    if (loading) return <Throbber />;
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

    function handleLogoUploadSuccess() {
        setShowLogoModal(false);
        loadCompetition();
    }

    return (
    <>


    {/* ----- HEADER: logo, comp-title, themes ----- */}
    <header className={styles.header}>
  
        <div className={styles.hero}>
            {/* ----- logo ----- */}
            <div className={styles.logo}>
                {competition.signedLogoUrl ? (
                <>
                    <div className={styles.logoContainer}>
                        <img className={styles.logoPic} src={competition.signedLogoUrl} alt={`${competition.title} logo`}/>
                    </div>

                    {competition.owner && 
                    user?.username === competition.owner.username && 
                    phase !== "finished" && (
                        <button 
                            className={styles.uploadLogoBtn}
                            onClick={() => setShowLogoModal(true)}
                        >
                            {competition.signedLogoUrl ? 'Change Logo' : 'Update Logo'}
                        </button>
                    )}
                </>
                ) : (
                <>
                    {competition.owner &&
                    user?.username === competition.owner.username &&
                    phase !== "finished" && (
                        <>
                        <div className={styles.logoContainer}>              
                            <img className={styles.noLogo} src="/competitions.svg" alt="Competition icon"/>
                        </div>

                        <button className={styles.uploadLogoBtn} onClick={() => setShowLogoModal(true)}>
                            Update Logo
                        </button>
                        </>
                    )}
                </>
                )}
            </div>


            <div className={styles.heroMeta}>

                {/* ----- comp title & owner ----- */}
                <p className={styles.heroEyebrow}>Competition</p>
                <h1 className={styles.title}>{competition.title}</h1>
                <p className={styles.owner}
                    onClick={() => navigate(`/users/${competition.owner.username}`)}>
                        By: {competition.owner?.username ?? "Deleted User"}
                </p>

                {/* ----- themes ----- */}
                <div className={styles.themePills}>
                    {(competition.themes ?? []).map((theme) => {
                    
                    const safeTheme = theme ?? "Default";
                    const themeClass = `${safeTheme
                        .replace(/\s+/g, "")
                        .replace(/&/g, "")}Color`;

                    return (
                        <span
                        className={`${styles.pill} ${themeClass}`}
                        key={safeTheme}
                        >
                        {safeTheme}
                        </span>
                    );
                    })}
                </div>
            </div>
        </div>
    </header>

    {/* DESCRIPTION */}
    <div className={styles.descriptionContainer}>
        <p className={styles.descriptionTitle}>Description</p>
        <p className={styles.description}>{competition.description}</p>
    </div>

    {/* ----- STATS: comp phase, time indicators & winner, participants ----- */}
    <div className={styles.stats}>
        {/* ----- comp phase ----- */}
        <div className={styles.statCell}>
            <span className={styles.statLabel}>Phase</span>
            <span className={styles.statValue}>{phase === "submission" ? "open" : phase === "finished" ? "closed" : phase}</span>
        </div>

        {/* ----- time indicators, winner ----- */}
        <div className={styles.statCell}>
            {phase === "submission" && (<>
                <span className={styles.statLabel}>Voting begins</span>
                <span className={styles.statValue}>{formatCountdown(countdownTarget)}</span>
            </>)}

            {phase === "voting" && (<>
                <span className={styles.statLabel}>Ends in</span>
                <span className={styles.statValue}>{formatCountdown(countdownTarget)}</span>
            </>)}

            {phase === "finished" && sorted.length > 0 && (<>
                <span className={styles.statLabel}>Winner</span>
                <span className={styles.statValue}
                    onClick={() => navigate(`/users/${sorted[0].user.username}`)}
                    style= {{cursor: "pointer"}}>
                            {sorted[0].user.username}
                </span>
            </>)}
        </div>

        {/* ----- participants ----- */}
        <div className={styles.statCell}>
            <span className={styles.statLabel}>Participants</span>
            <span className={styles.statValue}>{competition.submissions.length}</span>
        </div>
    </div>

            {/* VIEWS ----- submit & submissions */}
            {/* ----- submit ----- */}
            {phase === "submission" && !userSubmission && (
                <div className={styles.cta}>
                    <p className={styles.ctaTitle}>Want to participate?</p>

                    <button
                        className={mixins.uploadSubmit}
                        type="button"
                        onClick={() => navigate(`/competitions/${id}/submit`)}
                    >
                        <img src="/submit-upload.svg" alt="icon upload image" className={mixins.uploadSubmitIcon} />
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
                        <img src="/submit-edit.svg" alt="icon upload image" className={mixins.editSubmitIcon} />
                    </button>
                    <p className={styles.ctaSubtext}>
                        Edit your submission?
                    </p>
                </div>
            )}



            {/* ----- submissions ----- */}
            {(phase === "voting" || phase === "finished") && (
                // <div className={styles.gridWrapper}>
                <section className={styles.submissionsGrid}>


                    {!selectedSubmission ? (
                        <>

                    {/* <div className={styles.grid}> */}
                            {sorted.map((sub, i) => (
                                <div
                                    key={sub._id ?? i}
                                    className={styles.submissionCell}
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    <img
                                        className={styles.submissionImg}
                                        src={sub.signedImageUrl}
                                        alt=""
                                        onClick={() => sub.signedImageUrl && setFullscreenImage(sub.signedImageUrl)}
                                    />
                                    
                                    <div className={styles.submissionFooter}>

                                        {/* -------------------- */}
                                        {/* ----- FINISHED ----- */}
                                        {/* -------------------- */}
                                        {phase === 'finished' && (
                                        <>

                                            {/* ----- CONTRIBUTOR ----- */}
                                            {/* ----------------------- */}
                                            <p 
                                                className={styles.submissionContributor}
                                                onClick={() => {
                                                    setSelectedSubmission(sub);
                                                    navigate(`/users/${sub.user?.username}`);
                                                }}
                                            >{sub.user?.username ?? "Unknown"}</p>

                                            {/* ----- PLACEMENT ----- */}
                                            {/* --------------------- */}
                                            <div className={styles.placementContainer}>
                                                <img src="/medal.svg" alt="medal" className={styles.medalIcon}/>
                                                <span>
                                                    {getIndicator(sub, phase, i, user?._id) === "gold" ? "1"
                                                    : getIndicator(sub, phase, i, user?._id) === "silver" ? "2"
                                                    : "3"}
                                                </span>
                                            </div>
                                        </>
                                        )}


                                        {/* ------------------ */}
                                        {/* ----- VOTING ----- */}
                                        {/* ------------------ */}
                                        {phase === 'voting' && (
                                        <>
                                            <SubmissionExpanded
                                                submission={sub}
                                                phase={phase}
                                                userId={user?._id}
                                                onClose={() => setSelectedSubmission(null)}
                                                onVoteChange={handleVoteChange}
                                            />
                                        </>
                                        )}


                                    </div>


                                </div>
                            ))}

                        </>
                    ) : (
                        <SubmissionExpanded
                            submission={selectedSubmission}
                            phase={phase}
                            userId={user?._id}
                            onClose={() => setSelectedSubmission(null)}
                            onVoteChange={handleVoteChange}
                        />
                    )}
                </section>
            )}

            {showLogoModal && (
                <div className={mixins.modalOverlay} onClick={() => setShowLogoModal(false)}>
                    <div className={mixins.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={mixins.closeBtn}
                            onClick={() => setShowLogoModal(false)}
                        >
                            ✕
                        </button>
                        <ImageUploadForm
                            pictureType="logo"
                            competitionId={id}
                            onUploadSuccess={handleLogoUploadSuccess}
                        />
                    </div>
                </div>
            )}
    </>
    );
}
