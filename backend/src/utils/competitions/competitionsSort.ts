// Function that returns sorting configuration based on competition status
export const getCompetitionSort = (
  status?: "submission" | "voting" | "ended"
) => {

  // Switch based on the current competition status
  switch (status) {

    // When competitions are in submission phase
    case "submission":
      return {
        // Sort by voting start date ascending (soonest first)
        votingStartDate: 1,
      };

    // When competitions are in voting phase
    case "voting":
      return {
        // Sort by end date ascending (ending soonest first)
        endDate: 1,
      };

    // When competitions are ended
    case "ended":
      return {
        // Sort by end date descending (most recently ended first)
        endDate: -1,
        // Secondary sort by id for stable ordering
        _id: -1,
      };

    // Default sorting when no status is provided
    default:
      return {
        // Default: show most recently ended first
        endDate: -1,
      };
  }
};