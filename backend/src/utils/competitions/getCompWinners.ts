import { Competition } from "../../models/Competition";
import { CompetitionInterface } from "../../types";

export async function getCompWinners(comp: CompetitionInterface) {
    // sort all submission based on amount of votes
    // find three winners if possible
    // if more than one has the same amount of votes run tiebreaker
}
