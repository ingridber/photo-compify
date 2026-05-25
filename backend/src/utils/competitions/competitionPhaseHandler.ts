import { Competition } from "../../models/Competition";
import { CompetitionInterface } from "../../types";
import { checkPhaseAndUpdate } from "./competitionPhaseChecker";
import { getCompWinners } from "./getCompWinners";

export async function competitionPhaseHandler(comp: CompetitionInterface) {
    try {
    const phase = await checkPhaseAndUpdate(comp);
    const now = Date.now();

    if (phase === "submission") {
        setTimeout(() => {
            competitionPhaseHandler(comp);
        }, comp.votingStartDate.getTime() - now)
    }

    if (phase === "voting") {
        setTimeout(() => {
            competitionPhaseHandler(comp);
        }, comp.endDate.getTime() - now)
    }

    if (phase === "ended") {
        const winners = await getCompWinners(comp) //returns array with three users
        await Competition.findOneAndUpdate({_id: comp._id}, {$set: {winners: winners}})
    }
    } catch (err) {
        throw err
    }
};
