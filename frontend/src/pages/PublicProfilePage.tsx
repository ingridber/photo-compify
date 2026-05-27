import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import CompetitionsCard from "../components/competitions/CompetitionsCard";
import SubmissionCard from "../components/single-competition/SubmissionCard";
import type {Submission, Competition } from "../types/competitions";
import type { PublicProfile } from "../types/user";
import { Throbber } from "../components/user-feedback/Throbber";
import profileStyle from "../components/profile/profile.module.css";

export default function PublicProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [view, setView] = useState<"submissions" | "competitions">(
        "submissions"
    );

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch(
                    `http://localhost:3000/api/v1/user/${username}`
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await res.json();
                setProfile(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Unknown error");
                }
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [username]);

    if (loading) return <Throbber />;
    if (error) return <p>{error}</p>;
    if (!profile) return <p>User not found</p>;

    return (
        <>
            {/* HERO */}
            <header className={profileStyle.hero}>
                <div className={profileStyle.heroInner}>
                    {/* BACK BUTTON */}
                    {/* <button
                        onClick={() => navigate(-1)}
                        className={profileStyle.backBtn}
                    >
                        <img
                            src="/arrow-left.svg"
                            alt="back"
                            className={profileStyle.backBtnIcon}
                        />
                        Back
                    </button> */}

                    {/* AVATAR */}
                    <div
                        className={profileStyle.avatarRing}
                        onClick={() => setView("submissions")}
                    >
                        <div className={profileStyle.avatar}>
                            <DisplayProfilePicture src={profile.user.profilePicture?.url}/>
                        </div>
                    </div>

                    {/* META */}
                    <div className={profileStyle.heroMeta}>
                        <p className={profileStyle.heroEyebrow}>
                            Photographer
                        </p>

                        <h1
                            className={profileStyle.heroName}
                            onClick={() => setView("submissions")}
                        >
                            {profile.user.username}
                        </h1>

                        {/* THEMES */}
                        <div className={profileStyle.themePills}>
                            {profile.user.themes &&
                            profile.user.themes.length > 0 ? (
                                profile.user.themes.map((theme) => {
                                    const safeTheme = theme ?? "Default";

                                    const themeClass = `${safeTheme
                                        .replace(/\s+/g, "")
                                        .replace(/&/g, "")}Color`;

                                    return (
                                        <span
                                            key={safeTheme}
                                            className={`${profileStyle.pill} ${profileStyle[themeClass]}`}
                                        >
                                            {safeTheme}
                                        </span>
                                    );
                                })
                            ) : (
                                <span className={profileStyle.heroMuted}>
                                    No themes specified
                                </span>
                            )}
                        </div>

                        {/* CAMERA */}
                        <p className={profileStyle.cameraLine}>
                            <img
                                src="/camera-detail.svg"
                                alt="camera"
                                className={profileStyle.cameraIcon}
                            />

                            {profile.user.camera
                                ? profile.user.camera
                                : "Camera not specified"}
                        </p>
                    </div>
                </div>

                {/* STATS */}
                <div className={profileStyle.statsRow}>
                    <div
                        className={`${profileStyle.statCell} ${profileStyle.statClickable}`}
                        onClick={() => setView("competitions")}
                    >
                        <span className={profileStyle.statValue}>
                            {profile.stats.competitionsCreated}
                        </span>

                        <span className={profileStyle.statLabel}>
                            Hosted
                        </span>
                    </div>

                    <div
                        className={`${profileStyle.statCell} ${profileStyle.statClickable}`}
                        onClick={() => setView("submissions")}
                    >
                        <span className={profileStyle.statValue}>
                            {profile.stats.submissions}
                        </span>

                        <span className={profileStyle.statLabel}>
                            Submitted
                        </span>
                    </div>

                    <div className={profileStyle.statCell}>
                        <span className={profileStyle.statValue}>
                            {profile.stats.wins}
                        </span>

                        <span className={profileStyle.statLabel}>
                            Wins
                        </span>
                    </div>
                </div>
            </header>

            {/* SUBMISSIONS */}
            {view === "submissions" ? (
                <section className={profileStyle.submissionsGrid}>
                    {profile.submissions.length > 0 ? (
                        profile.submissions.map((submission: Submission) => (
                            <div
                                key={submission._id}
                                className={profileStyle.submissionCell}
                            >
                                <SubmissionCard
                                    submission={{
                                        ...submission,
                                        signedImageUrl:
                                            submission.imageUrl,
                                    }}
                                    indicator={
                                        submission.indicator ?? "none"
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/competitions/${
                                                typeof submission.competition ===
                                                "string"
                                                    ? submission.competition
                                                    : submission.competition._id
                                            }`
                                        )
                                    }
                                />
                            </div>
                        ))
                    ) : (
                        <p className={profileStyle.emptyText}>
                            No visible submissions yet
                        </p>
                    )}
                </section>
            ) : (
                <section className={profileStyle.competitionsListContainer}>
                    {profile.competitions.length > 0 ? (
                        profile.competitions.map(
                            (competition: Competition) => (
                                <div
                                    key={competition._id}
                                    className={profileStyle.competitionRow}
                                >
                                    <CompetitionsCard
                                        competition={competition}
                                    />
                                </div>
                            )
                        )
                    ) : (
                        <p className={profileStyle.emptyText}>
                            No competitions created yet
                        </p>
                    )}
                </section>
            )}
        </>
    );
}