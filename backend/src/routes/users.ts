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


const routerUser = express.Router();
routerUser.get("/export-my-data", (req, res, next) => {
    console.log("User data downloaded");
    next();
}, authenticateToken, exportUserData);

routerUser.get("/profile", authenticateToken, (req: Request, res: Response) => {
    res.json({
        message: "Authenticated",
        user: (req as any).user
    });
});

routerUser.patch('/username', authenticateToken, changeUsername);
routerUser.patch('/password', authenticateToken, changePassword);

routerUser.patch('/profilepicture', authenticateToken, changeProfilePicture);
routerUser.delete('/profilepicture', authenticateToken, deleteProfilePicture);

routerUser.post('/logout', logout);
routerUser.delete('/', authenticateToken, deleteUser);

routerUser.get('/competitions', authenticateToken, getUserCompetitions);
routerUser.get('/submissions', authenticateToken, getUserSubmissions);
routerUser.get('/stats', authenticateToken, getUserStats)

routerUser.get('/:username', getPublicProfile)
routerUser.patch('/edit', authenticateToken, editProfileDetails)




export { routerUser };