// Function that builds MongoDB filter based on competition status
export const getCompetitionFilter = (
  status:
    | "submission"
    | "voting"
    | "ended"
    | undefined,
) => {

  if(status) {
    return { phase: status };
  }
 return {};
};