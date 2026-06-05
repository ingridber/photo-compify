import express, { Response } from "express";
import { 
    changeUsername, 
    changePassword, 
    logout, 
    deleteUser, 
    changeProfilePicture,
    deleteProfilePicture,
    getUserCompetitions,
    getUserSubmissions,
    getUserStats,
    getPublicProfile
} from "../controllers/usersControllers";
import { editProfileDetails } from "../controllers/editControllers";
import { authenticateToken } from "../middleware/auth";
import { exportUserData } from "../controllers/ExportUserDataController";
import type { AuthRequest } from "../types";


const routerUser = express.Router();

routerUser.get("/export-my-data", (req: AuthRequest, res: Response, next) => {
    console.log("User data downloaded");
    next();
}, authenticateToken, exportUserData);

routerUser.get("/profile", authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({
        message: "Authenticated",
        user: req.user
    });
});

routerUser.patch('/username', authenticateToken, changeUsername);
routerUser.patch('/password', authenticateToken, changePassword);

routerUser.patch('/profilePicture', authenticateToken, changeProfilePicture);
routerUser.delete('/profilePicture', authenticateToken, deleteProfilePicture);

routerUser.post('/logout', logout);
routerUser.delete('/', authenticateToken, deleteUser);

routerUser.get('/competitions', authenticateToken, getUserCompetitions);
routerUser.get('/submissions', authenticateToken, getUserSubmissions);
routerUser.get('/stats', authenticateToken, getUserStats)

routerUser.get('/:username', getPublicProfile)
routerUser.patch('/edit', authenticateToken, editProfileDetails)


export { routerUser };