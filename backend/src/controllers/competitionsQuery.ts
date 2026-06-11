import { getCompetitionFilter } from "../utils/competitions/competitionFilter";
import { getPagination } from "../utils/competitions/pagination";
import { buildActiveCompetitionAggregation } from "../utils/competitions/competitionAggregation";
import { getThemeFilter } from "../utils/competitions/themeFilter";
import { supabase } from "../config/supabase";

// Generates a signed URL for an image stored in Supabase
async function getSignedImageUrl(filename: string) {
  const { data, error } = await supabase.storage
    .from("images")
    .createSignedUrl(filename, 60 * 60);

  if (error) return null;

  return data?.signedUrl; // Return secure temporary URL
}

export const buildCompetitionQuery = async (
  req: any,
  User: any,
  Competition: any
) => {
  // Extract search query string from URL (search)
  const search = req.query.search as string | undefined;

  const themes = req.query.themes as
  | string[]
  | string
  | undefined;

  // Extract status filter (?status=submission | voting | ended)
  const status = req.query.status as
    | "submission"
    | "voting"
    | "ended"
    | undefined;

  // Get pagination values (page number, limit per page, skip amount)
  const { page, limit, skip } = getPagination(req.query);

  // Current timestamp used for filtering time-based competition phases
  const now = new Date();

  // Build base MongoDB filter depending on competition status
  const query: any = {
    ...getCompetitionFilter(status),
    ...getThemeFilter(themes),
  };

  // SEARCH LOGIC
  // If search query exists, search by competition title or owner username
  if (search) {
    // Find users whose username matches search term (case-insensitive)
    const matchingUsers = await User.find({
      username: { $regex: search, $options: "i" },
    }).select("_id");

    // Extract matching user IDs
    const userIds = matchingUsers.map((u: any) => u._id);

    // Add OR condition: match title OR owner
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { owner: { $in: userIds } },
    ];
  }

  let competitions; // Final competition result array
  let totalCompetitions; // Total count for pagination

  // =========================
  // ACTIVE PIPELINE (submission, voting, ended)
  // =========================
  if (
    status === "submission" ||
    status === "voting" ||
    status === "ended"
  ) {

    // MongoDB aggregation pipeline for active competitions
    const pipeline = [
      { $match: query },

      // Inject dynamic sorting based on competition phase
      ...buildActiveCompetitionAggregation(status),

      // Populate owner data from users collection
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },

      // Populate image reference from images collection
      {
        $lookup: {
          from: "images",
          localField: "logoBanner",
          foreignField: "_id",
          as: "logoBanner",
        },
      },

      // Keep competitions even if they don't have an image
      {
        $unwind: {
          path: "$logoBanner",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Apply pagination
      { $skip: skip },
      { $limit: limit },
    ];

    // Count pipeline (used for pagination)
    const countPipeline = [
      { $match: query },
      { $count: "total" },
    ];

    // Execute count aggregation
    const countResult = await Competition.aggregate(countPipeline);
    totalCompetitions = countResult[0]?.total || 0;

    // Execute main aggregation pipeline
    competitions = await Competition.aggregate(pipeline || []);
  }
  
  // SIGNED URL GENERATION (Supabase storage)
  await Promise.all(
    competitions.map(async (comp: any) => {
      if (comp.logoBanner?.filename) {
        comp.signedLogoUrl = await getSignedImageUrl(
          comp.logoBanner.filename
        );
      }
    })
  );

  // Calculate total number of pages (minimum 1 page)
  const totalPages = Math.max(
    1,
    Math.ceil(totalCompetitions / limit)
  );

  // Return final structured response
  return {
    competitions,
    pagination: {
      page,
      limit,
      totalCompetitions,
      totalPages,
    },
  };
};