import { useUser } from "../hooks/useUser";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import mixins from "../styles/mixins.module.css";
import { useEffect, useState } from "react";
import { getUserStats } from "../services/api";
import { Outlet, useNavigate } from "react-router";
import ProfileEditDetails from "../components/profile/ProfileEditDetails";

export function ProfilePage() {

    const { user } = useUser();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);

    const [stats, setStats] = useState({
        wins: 0,
        submissions: 0,
        competitionsCreated: 0
    });

    useEffect(() => {

        async function loadStats() {

            try {

                const result = await getUserStats();

                setStats(result);

            } catch (err) {
                console.log(err);
            }
        }

        loadStats();

    }, []);

    return (
        <>



            {/* HEADER */}
            <section className={mixins.headerContainer}>

                <p 
                    onClick={() => navigate("/profile")}
                    className={mixins.username}>
                    {user ? user.username : "USER"}
                </p>

                <div
                    style={{
                        width: "7rem",
                        margin: "auto"
                    }}
                    onClick={() => navigate("/profile")}
                >
                    <DisplayProfilePicture
                        src={user?.profilePicture?.url}
                    />
                </div>

            </section>

            <button>
                <img
                    src={!showEdit? "/edit-pencil.svg" : "/close.svg"}
                    alt="edit profile icon"
                    style={{width:"30px"}}
                    onClick={() => setShowEdit(!showEdit)}
                />
            </button>
            {/* USER CAMERA & PREFERRED THEMES*/}

            <section>

                { showEdit ? (
                    <ProfileEditDetails 
                        handleSave={() => setShowEdit(false)}/>
                ):(
                    <>
                        <div>
                            <img
                                src="/camera-detail.svg"
                                alt="camera icon"
                            />
                            <p>{user?.camera? user.camera : "Not specified"}</p>
                        </div>
                        <div>
                            <img
                                src="/theme-detail.svg"
                                alt="theme icon"
                            />
                            <p>{user?.themes? user.themes : "Not specified"}</p>
                        </div>
                    </>
                )




                }
               


            </section>

{/* användare får välja max tre av följande themes:
    'Portrait',
    'Landscape',
    'Street',
    'Wildlife',
    'Macro',
    'Architecture',
    'Nature',
    'Travel',
    'Minimalist',
    'Black & White',
    'Long Exposure',
    'Abstract',
    'Aerial',
    'Night',
    'Astrophotography',
    'Documentary', */}




            {/* STATS */}
            <section>

                <div>
                    <p>Wins: {stats.wins}</p>
                    <p
                        onClick={() => navigate("/profile")}
                        >Submissions: {stats.submissions}</p>
                    <p onClick={() =>
                        navigate("/profile/competitions")
                    }>
                        Competitions created:
                        {stats.competitionsCreated}
                    </p>
                </div>

            </section>


            {/* CHILD ROUTES */}
            <Outlet />

        </>
    );
}