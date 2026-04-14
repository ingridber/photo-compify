import { InterfaceUser } from "../types/index";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

let mockUser: InterfaceUser = {
  "name": "Grace Eriksen",
  "email": "grace.eriksen@photomail.com",
  "username": "graceeriksen3",
  "password": "Hashed$lkkpo1mb",
  "profilePicture": {
    "url": "https://picsum.photos/id/10/200/200",
    "uploadedBy": "graceeriksen3",
    "uploadedAt": "2026-03-17T10:52:08.374Z"
  },
  "warnings": 2
};

export function changeUsername(req: Request, res: Response){
    const { newUsername } = req.body

    if (!newUsername) {
        res.status(400).json({ message: " Need to provide a username"})
        return
    };

    mockUser.username = newUsername
    res.status(200).json(mockUser)
};

export async function changePassword(req: Request, res: Response){
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    res.status(400).json({ message: "Need to fill both fields"});
    return;
  };

  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: "password does not match"});
    return;
  };

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  mockUser.password = hashedPassword;
  res.status(200).json({ message: "Password updated"});
};

export function changeProfilePicture(req: Request, res: Response){
  // placeholder.
    res.status(200).json({ message: "Profile picture updated"});
};

export function logout(req: Request, res: Response) {
  //placeholder väntan på JVT token.
  res.status(200).json({ message: "Logged out"});
};


export async function deleteUser(req: Request, res: Response){
  //placeholder Väntar på databas är på plats.
  res.status(200).json({ message: "Account deleted"});
};