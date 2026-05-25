import { Competition } from "../../models/Competition";
import { CompetitionInterface } from "../../types";

export async function checkPhaseAndUpdate(comp: CompetitionInterface) {

    const now = new Date();

    if (now >= comp.votingStartDate && now < comp.endDate) {
        try {
            await Competition.findOneAndUpdate(
                { _id: comp._id, phase: { $ne: 'voting' } },
                { $set: { phase: 'voting' } }
            )
            return 'voting'
        } catch (err) {
            throw err
        }
    }

    if (now >= comp.endDate) {
        try {
            await Competition.findOneAndUpdate(
                { _id: comp._id, phase: { $ne: 'ended' } },
                { $set: { phase: 'ended' } }
            )
            return 'ended'
        } catch (err) {
            throw err
        }
    }

    if (now < comp.votingStartDate && now < comp.endDate) {
        return 'submission'
    }
}
