export const buildActiveCompetitionAggregation = (
  status: "submission" | "voting" | "ended" | undefined
) => {

  // Decide sorting rules based on competition status
  switch (status) {

    // SUBMISSION PHASE
    // Sort competitions by endDate ascending (soonest ending first)
    case "submission":
      return [
        {
          $sort: {
            endDate: 1,
          },
        },
      ];

    // VOTING PHASE
    // Sort competitions by endDate ascending (soonest ending first)
    case "voting":
      return [
        {
          $sort: {
            endDate: 1,
          },
        },
      ];

    // ENDED PHASE
    // Sort competitions by endDate descending (latest ended first)
    // Then fallback sort by _id descending for stable ordering
    case "ended":
      return [
        {
          $sort: {
            endDate: -1,
            _id: -1, 
          },
        },
      ];

    // DEFAULT CASE
    // No custom sorting applied
    default:
      return [];
  }
};