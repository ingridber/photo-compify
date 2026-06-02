// Function that builds MongoDB filter based on competition status
export const getCompetitionFilter = (
  status:
    | "submission"
    | "voting"
    | "ended"
    | undefined,
  now: Date
) => {

  // SUBMISSION PHASE FILTER
  if (status === "submission") {
    return {
      // Competition has started
      startDate: { $lte: now },
      // Voting has not started yet
      votingStartDate: { $gt: now },
    };
  }

  // VOTING PHASE FILTER
  if (status === "voting") {
    return {
      // Voting has started
      votingStartDate: { $lte: now },
      // Competition has not ended yet
      endDate: { $gt: now },
    };
  }

  // ENDED PHASE FILTER
  if (status === "ended") {
    return {
      // Competition has ended
      endDate: {
        $lte: now,
        $ne: null, // Ensure endDate exists and is not null
      },
    };
  }

  // DEFAULT: no filtering applied
  return {};
};