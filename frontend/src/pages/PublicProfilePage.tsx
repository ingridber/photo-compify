import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import CompetitionsCard from "../components/competitions/CompetitionsCard";
import mixins from "../styles/mixins.module.css";
import SubmissionCard from "../components/single-competition/SubmissionCard";
import type {Submission, Competition } from "../types/competitions";
import type { PublicProfile } from "../types/user";
import { Throbber } from "../components/user-feedback/Throbber";

export default function PublicProfilePage() {

    const { username } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [view, setView] = useState<
        "submissions" | "competitions"
    >("submissions");

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

    if (loading) return <Throbber/>;

    if (error) return <p>{error}</p>;

    if (!profile) return <p>User not found</p>;

    return (
    <div className={mixins.main}>

        {/* NAVIGATE BACK BTN */}
        <button
            onClick={() => navigate(-1)}
            className={mixins.backBtn}>
            <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={mixins.backBtnIcon} />
        </button>

        {/* PROFILE HEADER */}
        <section className={mixins.headerContainer}>

            <p 
                className={mixins.username}
                onClick={() =>
                        setView("submissions")
                    }>
                {profile.user.username}
            </p>

            <div
                style={{
                    width: "7rem",
                    margin: "auto",
                    cursor: "pointer"
                }}
                onClick={() =>
                    setView("submissions")
                }
            >
                <DisplayProfilePicture
                    src={profile.user.profilePicture?.url}
                />
            </div>

        </section>


        <section>
            <div>
                <img
                    src="/camera-detail.svg"
                    alt="camera icon"
                />
                <p>{profile.user.camera? profile.user.camera : "Not specified"}</p>
            </div>
            <div>
                <img
                    src="/theme-detail.svg"
                    alt="theme icon"
                />
                <p>{profile.user.themes? profile.user.themes : "Not specified"}</p>
            </div>
        </section>



        {/* STATS */}
        <section>

            <p>Wins: {profile.stats.wins}</p>

            <p 
            style={{cursor: "pointer"}} // TA BORT SEN !!!!!
            onClick={() =>
                    setView("submissions")
                }>
                Submissions:
                {profile.stats.submissions}
            </p>

            <p 
            style={{cursor: "pointer"}} // TA BORT SEN !!!!!
            onClick={() =>
                    setView("competitions")
                }>
                Competitions created:
                {profile.stats.competitionsCreated}
            </p>

        </section>

        {/* ---------- SUBMISSIONS ---------- */}
        {view === "submissions" ? (

            <div className={mixins.profileSubmissionsgrid}>

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

                    <p>No visable submissions yet</p>


                )}

            </div>

        ) : (

            <div>

                {profile.competitions.map(
                    (competition: Competition) => (

                        <CompetitionsCard
                            key={competition._id}
                            competition={competition}
                        />

                    )
                )}

            </div>

        )}

    </div>
)}