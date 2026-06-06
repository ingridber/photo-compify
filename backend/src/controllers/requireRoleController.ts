import { Request, Response } from "express"; 
import { User } from "../models/User"; 

export async function deleteUserById(
    req: Request,
    res: Response
) {
    // Controller som hanterar borttagning av användare via ID

    const { id } = req.params; 
    // Hämtar user-id från URL-parametrar

    try {
        // kör try catch för att hantera fel från databasen

        const user = await User.findById(id); 
        // Söker efter användaren i databasen baserat på ID

        if (!user) {
            // Om ingen användare hittas med det ID = 404 fel

            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(id); 
        // Tar bort användaren från databasen

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (err) {

        return res.status(500).json({
            message: "Server error",
            err
        });
    }
}