import type { Competition } from "../types/competitions";

export function getCompetitionPhase(
  comp: Competition,
): "submission" | "voting" | "ended" {
  const now = new Date();
  const votingStart = new Date(comp.votingStartDate);
  const end = new Date(comp.endDate);

  // If competition already has ended
  if (now >= end) return "ended";

  // If voting has started but not closed
  if (now >= votingStart) return "voting";

  return "submission";
}