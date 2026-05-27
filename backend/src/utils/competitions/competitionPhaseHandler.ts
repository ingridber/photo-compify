import { Competition } from "../../models/Competition";
import { CompetitionInterface } from "../../types";
import { PhaseCheckResult } from "./competitionPhaseChecker";
import { getCompWinners } from "./getCompWinners";

export async function competitionPhaseHandler(
    comp: CompetitionInterface,
    { previousPhase, currentPhase }: PhaseCheckResult
): Promise<void> {

    if (previousPhase === 'submission' && currentPhase === 'voting') {
        //notify participants voting has started
    }

    if (previousPhase === 'voting' && currentPhase === 'ended') {
        const winners = await getCompWinners(comp);
        await Competition.findOneAndUpdate(
            { _id: comp._id },
            { $set: { winners } }
        );
        //notify participants competition has ended
    }
}
