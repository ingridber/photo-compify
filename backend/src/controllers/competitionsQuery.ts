import { getCompetitionFilter } from "../utils/competitions/competitionFilter";
import { getCompetitionSort } from "../utils/competitions/competitionsSort";
import { getPagination } from "../utils/competitions/pagination";
import { buildActiveCompetitionAggregation } from "../utils/competitions/competitionAggregation";
import { supabase } from "../config/supabase";

async function getSignedImageUrl(filename: string) {
  const { data, error } = await supabase.storage
    .from("images")
    .createSignedUrl(filename, 60 * 60);
  if (error) return null;
  return data?.signedUrl;
}

export const buildCompetitionQuery = async (
  req: any,
  User: any,
  Competition: any
) => {

  // Extract search query string from URL (?search=...)
  const search = req.query.search as string | undefined;

  // Extract status filter (?status=active | historical)
  const status = req.query.status as "active" | "historical" | undefined;

  // Get pagination values (page number, limit per page, skip amount)
  const { page, limit, skip } = getPagination(req.query);

  // Current date used for time-based filtering
  const now = new Date();

  // Build base MongoDB query depending on status (active / historical)
  const query: any = {
    ...getCompetitionFilter(status, now),
  };

  // SEARCH LOGIC
  // If search exists we search both competition title and owner username
  if (search) {

    // Find users whose username matches the search term (case-insensitive)
    const matchingUsers = await User.find({
      username: { $regex: search, $options: "i" },
    }).select("_id");

    // Extract matching user IDs
    const userIds = matchingUsers.map((u: any) => u._id);

    // Add OR condition to query:
    // 1) match competition title
    // 2) match competitions owned by matching users
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { owner: { $in: userIds } },
    ];
  }

  // Variables that will hold results and total count
  let competitions;
  let totalCompetitions;

  // =========================
  // ACTIVE → AGGREGATION PIPELINE
  // =========================
  if (status === "active") {

    // Huvudpipeline som hämtar aktiva tävlingar
    const pipeline = [
      { $match: query },

      // Här körs vår pipeline som:
      // 1. Bestämmer fas (voting/submission)
      // 2. Filtrerar bort avslutade tävlingar
      // 3. Sorterar voting först → kortast tid kvar
      ...buildActiveCompetitionAggregation(now),

      // Hämta owner-dokument från users collection
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },

      // Hämta logoBanner från images collection
      {
        $lookup: {
          from: "images",
          localField: "logoBanner",
          foreignField: "_id",
          as: "logoBanner",
        },
      },

      // Behåll tävlingar även om de saknar bild
      { $unwind: { path: "$logoBanner", preserveNullAndEmptyArrays: true } },

      // Pagination i pipeline
      { $skip: skip },
      { $limit: limit },
    ];

    // Pipeline för att räkna totalt antal aktiva tävlingar (för pagination)
    const countPipeline = [
      { $match: query },
      ...buildActiveCompetitionAggregation(now),
      { $count: "total" },
    ];

    // Execute count pipeline
    const countResult = await Competition.aggregate(countPipeline);
    totalCompetitions = countResult[0]?.total || 0;

    // Execute main pipeline
    competitions = await Competition.aggregate(pipeline);
  }

  // =========================
  // HISTORICAL → NORMAL FIND
  // =========================
  else {

    // Count historical competitions using normal query
    totalCompetitions = await Competition.countDocuments(query);

    // Fetch historical competitions with populate + sorting
    competitions = await Competition.find(query)
      .populate("owner", "username")
      .populate("logoBanner")
      .sort(getCompetitionSort(status))
      .skip(skip)
      .limit(limit)
      .lean();
  }

  // SIGNED URLS (works for both active + historical)
  // Generate signed image URLs if image exists
  await Promise.all(
    competitions.map(async (comp: any) => {
      if (comp.logoBanner?.filename) {
        comp.signedLogoUrl = await getSignedImageUrl(comp.logoBanner.filename);
      }
    })
  );

  // Calculate total number of pages
  const totalPages = Math.max(1, Math.ceil(totalCompetitions / limit));

  // Return final response object
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
