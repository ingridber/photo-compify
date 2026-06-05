import { Request, Response } from "express";
import { User } from "../models/User";
import { Submission } from "../models/Submission";
import { CompetitionVote } from "../models/CompetitionVote";
import { Competition } from "../models/Competition";
import type { AuthRequest } from "../types";

export async function exportUserData(req: AuthRequest, res: Response) {
  try {
    // Extract user ID from authenticated request (added by auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Fetch user document from database and populate profile picture reference
    const userDoc = await User.findById(userId)
      .populate("profilePicture")
      .lean(); // Convert Mongoose document to plain JS object

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a safe version of user data (exclude sensitive/internal fields)
    const safeUser = {
      id: userDoc._id,
      username: userDoc.username,
      email: userDoc.email,
      camera: userDoc.camera,
      themes: userDoc.themes,
      profilePicture: userDoc.profilePicture,
      createdAt: userDoc.createdAt,
    };

    // Fetch all submissions made by this user
    const submissions = await Submission.find({ user: userId })
      .populate("image") // Attach image data
      .lean();

    // Map submissions into a safe/public format
    const safeSubmissions = submissions.map((s) => ({
      id: s._id, // Submission ID
      competition: s.competition, // Related competition ID
      image: s.image, // Submission image data
      votesCount: Array.isArray(s.votes) ? s.votes.length : 0, // Count votes safely
      createdAt: s.createdAt, // Submission timestamp
    }));

    // Fetch all votes made by this user
    const votes = await CompetitionVote.find({ user: userId })
      .populate("competition") // Attach competition info
      .lean();

    // Map votes into safe format
    const safeVotes = votes.map((v) => ({
      id: v._id, // Vote ID
      competition: v.competition, // Competition voted on
      createdAt: v.createdAt, // When vote was made
    }));

    // Fetch competitions created by this user
    const competitionsCreated = await Competition.find({
      owner: userId,
    }).lean();

    // Map created competitions into safe format
    const safeCompetitionsCreated = competitionsCreated.map((c) => ({
      id: c._id, // Competition ID
      title: c.title, // Competition title
      description: c.description, // Description
      themes: c.themes, // Themes/categories
      startDate: c.startDate, // Start date
      endDate: c.endDate, // End date
      phase: c.phase, // Current phase/status
      createdAt: c.createdAt, // Creation timestamp
    }));

    // Return full exported dataset as JSON response
    return res.json({
      exportedAt: new Date(), // Timestamp of export
      user: safeUser, // User profile data
      submissions: safeSubmissions, // User submissions
      votes: safeVotes, // User votes
      competitionsCreated: safeCompetitionsCreated, // Competitions user created
    });
  } catch (err) {
    console.error("exportUserData error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
}
