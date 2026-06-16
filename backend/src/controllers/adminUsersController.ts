import { Request, Response } from "express";
import { getPagination } from "../utils/competitions/pagination";
import { User } from "../models/User";

// Function to get all users
export async function getAllUsers(req: Request, res: Response) {
  try {
    // Gets pagination values from the query parameters
    const { page, limit, skip } = getPagination(req.query);

    // Gets search term from query parameters
    const search = req.query.search as string | undefined;

    // Gets role filter from the query parameters
    const role = req.query.role as string | undefined;
    // Gets warnings filter from the query parameters
    const warnings = req.query.warnings as string | undefined;

    // Creates an empty filter object
    const filter: any = {};

    // Role filter
    if (role && ["user", "moderator", "admin"].includes(role)) {
      filter.role = role;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Warning filter
    if (warnings !== undefined) {
      filter.warnings = { $gte: Number(warnings) };
    }

    // get users from the database
    // Selects only the specified fields
    // Sorts users by creation date in descending order
    // Skips documents based on pagination
    // Limits the number of returned documents
    const users = await User.find(filter)
      .select("username email role warnings createdAt lastLogin")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Counts the total number of users matching the filter
    const totalUsers = await User.countDocuments(filter);

    // Calculates the total number of pages
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

    // Returns users together with pagination information
    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

// Function to update a user's role
export async function updateUserRole(req: Request, res: Response) {
  try {
    // Gets the new role from the request body
    const { role } = req.body;

    // Validates that the role is allowed
    if (!["user", "moderator", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Updates the user's role using the id from the route parameters
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Returns the updated user
    return res.status(200).json(user);
  } catch {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
