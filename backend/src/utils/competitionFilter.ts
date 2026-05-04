export const getCompetitionFilter = (
  // If status is "active", return competitions that have not ended yet
  status: "active" | "historical" | undefined,
  now: Date
) => {
  if (status === "active") {
    return { endDate: { $gt: now } }; // endDate is greater than now = still active competitions
  }

  // If status is "finished", return competitions that have already ended
  if (status === "historical") {
    return { endDate: { $lte: now } }; // endDate is less than or equal to now = finished competitions
  }

  return {};
};