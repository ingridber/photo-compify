import express, { Request, Response } from "express";
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
import { get } from "http";
import { getSubmission } from "../controllers/submissionsController";
import { exportUserData } from "../controllers/ExportUserDataController";
import { AuthRequest } from "../types";


const routerUser = express.Router();

routerUser.get("/export-my-data", (req, res, next) => {
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