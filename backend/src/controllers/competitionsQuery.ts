import { getCompetitionFilter } from "../utils/competitionFilter";
import { getCompetitionSort } from "../utils/competitionsSort";
import { getPagination } from "../utils/pagination";

export const buildCompetitionQuery = async (
  req: any,
  User: any,
  Competition: any
) => {

  // Extract search query from request (optional string)
  const search = req.query.search as string | undefined;

  // Extract status filter (active or historical competitions)
  const status = req.query.status as "active" | "historical" | undefined;

  // Get pagination values (page number, limit per page, skip amount)
  const { page, limit, skip } = getPagination(req.query);

  // Get current date/time for filtering active vs finished competitions
  const now = new Date();

  // Build base MongoDB query using status filter (active / historical)
  const query: any = {
    ...getCompetitionFilter(status, now),
  };

  // If search exists, apply search filtering
  if (search) {

    // Find users whose username matches the search term (case-insensitive)
    const matchingUsers = await User.find({
      username: { $regex: search, $options: "i" },
    }).select("_id");

    // Extract user IDs from matched users
    const userIds = matchingUsers.map((u: any) => u._id);

    // Add OR condition:
    // - match competition title
    // - OR match competitions by owner user IDs
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { owner: { $in: userIds } },
    ];
  }

  // Count total documents that match query (used for pagination metadata)
  const totalCompetitions = await Competition.countDocuments(query);

  // Calculate total number of pages (minimum 1 page)
  const totalPages = Math.max(1, Math.ceil(totalCompetitions / limit));

  // Fetch competitions from database with:
  // - applied filters (query)
  // - populated owner username
  // - sorting (active/popular or historical/latest)
  // - pagination (skip + limit)
  const competitions = await Competition.find(query)
    .populate("owner", "username")
    .sort(getCompetitionSort(status))
    .skip(skip)
    .limit(limit);

  // Return final result object with data + pagination info
  return {
    competitions,
    pagination: {
      page,
      limit,
      totalCompetitions,
      totalPages,
    },
  };
}