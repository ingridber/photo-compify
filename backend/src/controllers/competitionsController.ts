import type { CompetitionInterface, AuthRequest } from "../types/index";
import type { Request, Response } from "express";
import { Competition } from "../models/Competition";
import { User } from "../models/User";
import { buildCompetitionQuery } from "./competitionsQuery";
import { competitionPhaseHandler} from "../utils/competitions/competitionPhaseHandler";
import z from "zod";

// ---------------------------------------
// --------- GET ALL COMPETITION ---------
// ---------------------------------------
export async function getAllCompetitions(req: Request, res: Response) {
  try {
    const result = await buildCompetitionQuery(req, User, Competition);

    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}


// -----------------------------------------
// --------- GET COMPETITION BY ID ---------
// -----------------------------------------

const getCompetitionByIdSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: "The request competition was not found"})
  })
})

export async function getCompetitionById(req: AuthRequest, res: Response) {
  const validation = getCompetitionByIdSchema.safeParse(req);

  if (!validation.success) {
    const message = validation.error.issues[0]?.message ?? "validation failed";
    return res.status(400).json({
      code: "COMPETITION_NOT_FOUND",
      message: message,
      status: 400,
    });
  }

  const id = validation.data.params.id;

  const competition = await Competition.findById(id).populate(
    "owner",
    "username",
  ).populate("logoBanner");

  if (competition === null) {
    return res.status(404).json({
      code: "COMPETITION_NOT_FOUND",
      message: "The requested competition was not found",
      status: 404,
    });
  }

  await competition.populate({
    path: "submissions",
    populate: [
      { path: "image" },
      { path: "user", select: "username" }
    ]
  });

  if (competition.logoBanner?.getSignedUrl) {
     const url = await competition.logoBanner.getSignedUrl();
     competition.signedLogoUrl = url;
  }

  const now = new Date();
  if (competition.votingStartDate <= now) {
    await Promise.all(
        competition.submissions.map(async (sub: any) => {
            if (sub.image?.getSignedUrl) {
                const url = await sub.image.getSignedUrl();
                sub._doc.signedImageUrl = url;
            }
        })
    )
  } else if (req.user) {
      const ownSubmission = competition.submissions.find(
          (sub: any) => sub.user?._id.toString() === req.user?.id.toString()
      );
      if (ownSubmission?.image?.getSignedUrl) {
          ownSubmission._doc.signedImageUrl = await ownSubmission.image.getSignedUrl();
      };
  }

  res.status(200).json(competition);
}

// --------------------------------------
// --------- CREATE COMPETITION ---------
// --------------------------------------

const createCompetitionSchema = z.object({
  title: z
    .string({ required_error: "One or more required fields are missing"})
    .trim()
    .min(3, "Title must be between 3 and 50 characers")
    .max(50, "Title must be between 3 and 50 characers"),
  description: z
    .string({ required_error: "Description must be between 3 and 250 characters"})
    .trim()
    .min(3, "Description must be between 3 and 250 characters")
    .max(250, "Description must be between 3 and 250 characters"),
  themes: z
    .array(z.string(),{ required_error: "You must provide at least one theme"})
    .min(1, "You must provide at least one theme"),
  logoBanner: z.string().nullable().optional()
})

export async function createCompetition(req: AuthRequest, res: Response) {
  const validation = createCompetitionSchema.safeParse(req.body);

  if (!validation.success) {
    const message = validation.error.issues[0]?.message ?? "Validation failed";
    return res.status(400).json({
      code: "MISSING_DATA",
      message: message,
      status: 400,
    });
  }

  const { title, description, themes, logoBanner } = validation.data;

  const competition = await Competition.create({
    owner: req.user!.id,
    title: title,
    description: description,
    themes: themes,
    logoBanner: logoBanner ? logoBanner : null,
  });

  const now = Date.now();
  setTimeout(() => {
      // TODO: korkat ha inte separat timeout och du saknar 1 av 2 arg i funkzionen. (review 4)
      competitionPhaseHandler(competition);
  }, competition.votingStartDate.getTime() - now)

  res.status(201).json(competition);
}

// --------------------------------------
// --------- UPDATE COMPETITION ---------
// --------------------------------------

const updateCompetitionSchema = createCompetitionSchema.partial();


export async function updateCompetition(req: AuthRequest, res: Response) {
  const validation= updateCompetitionSchema.safeParse(req.body);

  if(!validation.success) {
    const message = validation.error.issues?.[0]?.message ?? "validation failed";
    return res.status(400).json({message});
  }

  const { title, description, themes, logoBanner } = validation.data;

  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        code: "COMPETITION_NOT_FOUND",
        message: "The requested competition was not found",
        status: 404,
      });
    }

    if (competition.owner.toString() !== req.user!.id) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "You are not the owner of the competition",
        status: 403,
      });
    }

    const updates: Partial<CompetitionInterface> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (themes) updates.themes = themes;
    if (logoBanner) updates.logoBanner = logoBanner;
    const updated = await Competition.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true },
    );
    res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "something went wrong",
      status: 500,
    });
  }
}

// --------------------------------------
// --------- DELETE COMPETITION ---------
// --------------------------------------
export async function deleteCompetition(req: AuthRequest, res: Response) {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        code: "COMPETITION_NOT_FOUND",
        message: "The requested competition was not found",
        status: 404,
      });
    }

    if (competition.owner.toString() !== req.user!.id) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "You are not the owner of the competition",
        status: 403,
      });
    }

    await Competition.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "something went wrong",
      status: 500,
    });
  }
}
