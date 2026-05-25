import { useEffect, useState } from "react";
import { getUserComps } from "../../services/api";
import CompetitionsCard from "../competitions/CompetitionsCard";
import { Throbber } from "../user-feedback/Throbber";
import type { Competition } from "../../types/competitions";

export default function ProfileCompetitions() {

    const [competitions, setCompetitions] =
        useState<Competition[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        async function loadCompetitions() {

            try {

                const result =
                    await getUserComps();

                setCompetitions(
                    result.competitions
                );

            } catch (err) {




                if (err instanceof Error) {

                    setError(err.message);

                } else {

                    setError(
                        "Failed to load competitions"
                    );
                }

            } finally {

                setLoading(false);
            }
        }

        loadCompetitions();

    }, []);

    if (loading) {
        return <Throbber/>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (

        <div>

            {competitions.length > 0 ? (

                competitions.map(
                    (competition) => (

                        <CompetitionsCard
                            key={competition._id}
                            competition={competition}
                        />

                    )
                )

            ) : (

                <p>
                    No competitions created
                </p>

            )}

        </div>
    );
}