export const getCompetitionSort = (
  status?: "active" | "historical"
) => {
  switch (status) {
    case "active":
      return { participantCount: -1 }; // most participants first

    case "historical":
      return { endDate: -1 }; // shows recent finished competitions first

    default:
      return { participantCount: -1 };
  }
};