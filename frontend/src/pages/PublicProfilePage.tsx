import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import CompetitionsCard from "../components/competitions/CompetitionsCard";
import mixins from "../styles/mixins.module.css";
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
    const [view, setView] = useState<"submissions" | "competitions">("submissions");

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch(`http://localhost:3000/api/v1/user/${username}`);

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

    if (loading) return <Throbber/>;
    if (error) return <p>{error}</p>;
    if (!profile) return <p>User not found</p>;

    return (
    <div className={mixins.main}>

        {/* PROFILE HEADER */}
        <section className={mixins.headerContainer}>
            {/* NAVIGATE BACK BTN */}
            <button
                onClick={() => navigate(-1)}
                className={profileStyle.backBtn}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={profileStyle.backBtnIcon} />
            </button>
            <div 
                className={profileStyle.profilePictureContainer}
                onClick={() =>setView("submissions")}
            >
                <DisplayProfilePicture src={profile.user.profilePicture?.url}/>
            </div>
            <p 
                className={profileStyle.username}
                onClick={() => setView("submissions")}>
                    {profile.user.username}
            </p>
        </section>

        {/* ----- CAMERA AND THEMES DETAILS ----- */}
        <section className={profileStyle.profileDetailsContainer}>
            <div className={profileStyle.detailsContainer}>
                <img src="/camera-detail.svg" alt="camera icon" className={profileStyle.detailsIcon}/>
                <p className={profileStyle.detailsText}>
                    {profile.user.camera? profile.user.camera : "Not specified"}</p>
            </div>

            <div className={profileStyle.detailsContainer}>
                <img src="/theme-detail.svg" alt="theme icon" className={profileStyle.detailsIcon}/>

                {profile.user.themes && profile.user.themes.length > 0 ? (
                    profile.user.themes.map((theme) => {
          
                    const safeTheme = theme ?? "Default";
                    const themeClass = `${safeTheme
                        .replace(/\s+/g, "")
                        .replace(/&/g, "")}Color`;

                    return (
                        <span
                        className={`${profileStyle.theme} ${profileStyle[themeClass]}`}
                        key={safeTheme}
                        >
                        {safeTheme}
                        </span>
                    );
                    })
                    ) : (
                        <span className={profileStyle.detailsText}>Not specified</span>
                    )}
            </div>
        </section>

        {/* STATS */}
        <section className={profileStyle.profileStatsContainer}>
            <div 
                className={`${profileStyle.statContainer} ${profileStyle.competitionsContainer}`}
                onClick={() =>setView("competitions")}>
                    <p className={profileStyle.statTitle}>Host</p>
                    <p className={profileStyle.statValue}>{profile.stats.competitionsCreated}</p>
            </div>
            <div 
                className={`${profileStyle.statContainer} ${profileStyle.submissionContainer}`}
                onClick={() =>setView("submissions")}>
                    <p className={profileStyle.statTitle}>Submissions</p>
                    <p className={profileStyle.statValue}>{profile.stats.submissions}</p>
            </div>
            <div className={profileStyle.statContainer}>
                <p className={profileStyle.statTitle}>Wins</p>
                <p className={profileStyle.statValue}>{profile.stats.wins}</p>
            </div>
        </section>

        {/* ---------- SUBMISSIONS ---------- */}
        {view === "submissions" ? (
            <div className={profileStyle.profileSubmissionsgrid}>
                {profile.submissions.length > 0 ? (
                    profile.submissions.map(
                        (submission: Submission) => (
                            <SubmissionCard
                                key={submission._id}
                                submission={{
                                    ...submission,
                                    signedImageUrl:
                                        submission.imageUrl
                                }}
                                indicator={
                                    submission.indicator ?? "none"
                                }
                                onClick={() =>
                                    navigate(
                                        `/competitions/${
                                            typeof submission.competition === "string"
                                            ? submission.competition
                                            : submission.competition._id}`
                                    )
                                }
                            />
                        )
                    )
                ) : (
                    <p className={profileStyle.noSubmissionsText}>No visable submissions yet</p>
                )}
            </div>
        ) : (
            <div className={profileStyle.ProfileCompetitions}>
                {profile.competitions.map(
                    (competition: Competition) => (
                        <div className={profileStyle.competitionsDisplayContainer}>
                            <CompetitionsCard
                                key={competition._id}
                                competition={competition}
                            />
                        </div>
                    )
                )}
            </div>
        )}
    </div>
)}