import { useEffect, useState } from "react";
import { getUserComps } from "../../services/api";
import CompetitionsCard from "../competitions/CompetitionsCard";
import { Throbber } from "../user-feedback/Throbber";
import type { Competition } from "../../types/competitions";
import profileStyle from "./profile.module.css";

export default function ProfileCompetitions() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCompetitions() {
            try {
                const result = await getUserComps();
                setCompetitions(result.competitions);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Failed to load competitions");
                }
            } finally {
                setLoading(false);
            }
        }
        loadCompetitions();
    }, []);

    if (loading) {return <Throbber/>;}
    if (error) {return <p>{error}</p>;}

    return (
        <>
            {competitions.length > 0 ? (
                competitions.map(
                    (competition) => (
                        <div className={profileStyle.competitionsDisplayContainer}>
                            <CompetitionsCard
                                key={competition._id}
                                competition={competition}
                            />
                        </div>
                    )
                )
            ) : (
                <p>
                    No competitions created
                </p>
            )}
        </>
    );
}