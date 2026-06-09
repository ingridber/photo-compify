import type { CompetitionInterface, AuthRequest, CompetitionSubmissionInterface, ImageInterface } from "../types/index";
import type { Request, Response } from "express";
import { Competition } from "../models/Competition";
import { User } from "../models/User";
import { buildCompetitionQuery } from "./competitionsQuery";
import z from "zod";
import { requiredString } from "../utils/validationHelpers";
import { Types } from "mongoose";
import { Submission } from "../models/Submission";
import { supabase } from "../config/supabase";
import { CompetitionVote } from "../models/CompetitionVote";
import { Image } from "../models/Image";
import { Notification } from "../models/Notification";


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
      .string({ error: (issue) => issue.input === undefined ? "The request competition was not found" : "Invalid competition ID"})
  })
})

type PopulatedSubmission = Omit<CompetitionSubmissionInterface, "user" | "image"> & {
    user?: {
        _id: Types.ObjectId | string;
        username?: string;
    };
    image?: ImageInterface & {
        getSignedUrl?: () => Promise<string>;
    };
    signedImageUrl?: string;
    set: (path: string, value: unknown, options?: {strict?: boolean}) => void;
}

type PopulatedLogoBanner = {
    getSignedUrl: () => Promise<string>;
}

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
  ).populate<{ logoBanner: PopulatedLogoBanner | null }>("logoBanner");

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

    competition.set("signedLogoUrl", url, { strict: false });
}

  const submissions = competition.submissions as unknown as PopulatedSubmission[];

  const now = new Date();
  if (competition.votingStartDate <= now) {
    await Promise.all(
        submissions.map(async (sub) => {
            if (sub.image?.getSignedUrl) {
                const url = await sub.image.getSignedUrl();
                sub.set("signedImageUrl", url, {strict: false});
            }
        })
    )
  } else if (req.user) {
      const ownSubmission = submissions.find(
          (sub) => sub.user?._id.toString() === req.user?.id.toString()
      );
      if (ownSubmission?.image?.getSignedUrl) {
            const url = await ownSubmission.image.getSignedUrl();
            ownSubmission.set("signedImageUrl", url, {strict: false});
      };
  }

  res.status(200).json(competition);
}

// --------------------------------------
// --------- CREATE COMPETITION ---------
// --------------------------------------

const createCompetitionSchema = z.object({
  title: requiredString("One or more required fields are missing")
    .trim()
    .min(3, "Title must be between 3 and 50 characers")
    .max(50, "Title must be between 3 and 50 characers"),
  description: requiredString("Description must be between 3 and 250 characters")
    .trim()
    .min(3, "Description must be between 3 and 250 characters")
    .max(250, "Description must be between 3 and 250 characters"),
  themes: z
    .array(z.string(),{ error: "You must provide at least one theme"})
    .min(1, "You must provide at least one theme"),
  logoBanner: z
    .string({error: "Logo banner must be an image id"})
    .refine((id) => Types.ObjectId.isValid(id), {error: "Invalid logo banner image id"})
    .nullable()
    .optional()
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
    logoBanner: logoBanner ? new Types.ObjectId(logoBanner) : null,
  });

  res.status(201).json(competition);
}

// --------------------------------------
// --------- UPDATE COMPETITION ---------
// --------------------------------------

const updateCompetitionSchema = createCompetitionSchema.partial();


export async function updateCompetition(req: AuthRequest, res: Response) {
  const validation = updateCompetitionSchema.safeParse(req.body);

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

    const isOwner = competition.owner.toString() === req.user!.id;
    const isAdmin = req.user!.role === "admin";

    if (!isOwner && !isAdmin) {
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
    if (logoBanner !== undefined) {
        updates.logoBanner = logoBanner ? new Types.ObjectId(logoBanner) : null;
    }
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
    const competition = await Competition.findById(req.params.id).populate<{
      submissions: (CompetitionSubmissionInterface & {
        image?: ImageInterface;
      })[];
    }>("submissions", "image votes");

    if(!competition) {
      return res.status(404).json({
        code: "COMPETITION_NOT_FOUND",
        message: "The requested competition was not found",
        status: 404,
      });
    }

    const isOwner = competition.owner.toString() === req.user!.id;
    const isAdmin = req.user!.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "You are not the owner of the competition",
        status: 403,
      });
    }

    if (competition.phase === "ended") {
      return res.status(403).json({
        code: "COMPETITION_PHASE_VIOLATED",
        message: "Competitions that have ended can not be deleted",
        status: 403,
      });
    }

    const submissionIds = competition.submissions.map((sub) => sub._id);

    const imageFilenames: string[] = [];
    const imageIds: Types.ObjectId[] = [];

    for (const sub of competition.submissions) {
      if (sub.image) {
        const image = sub.image as ImageInterface;
        imageFilenames.push(image.filename);
        imageIds.push(image._id);
      }
    }

    if (imageFilenames.length > 0) {
      await supabase.storage.from("images").remove(imageFilenames);
      await Image.deleteMany({ _id: { $in: imageIds }});
    }

    await Submission.deleteMany({ _id: { $in: submissionIds}});

    if (competition.logoBanner) {
      const logo = await Image.findById(competition.logoBanner);
      if (logo){
        await supabase.storage.from("images").remove([logo.filename]);
        await Image.findByIdAndDelete(logo._id);
      }
    }

    await CompetitionVote.deleteMany({ competition: competition._id});
    await Notification.deleteMany({ competition: competition._id});
    await Competition.findByIdAndDelete(req.params.id);

    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      status: 500,
    });
  }
}

export async function adminSetCompetitionPhase(req: AuthRequest, res: Response) {
  const isAdmin = req.user!.role === "admin";

  if (!isAdmin) {
    return res.status(403).json({
      message: "Admin only",
    });
  }

  const { id } = req.params;

  const phaseSchema = z.object({
    phase: z.enum(["submission", "voting", "ended"]),
  });

  const validation = phaseSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid phase",
    });
  }

  const { phase } = validation.data;

  const competition = await Competition.findById(id);

  if (!competition) {
    return res.status(404).json({
      message: "Competition not found",
    });
  }

  competition.phase = phase;
  await competition.save();

  return res.status(200).json({
    message: "Phase updated",
    competition,
  });
}