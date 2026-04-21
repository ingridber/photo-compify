import express, { Request, Response } from "express";
import { 
    changeUsername, 
    changePassword, 
    logout, 
    deleteUser, 
    changeProfilePicture 
} from "../controllers/usersControllers";
import { authenticateToken } from "../middleware/auth";


const routerUser = express.Router();

routerUser.get("/profile", authenticateToken, (req: Request, res: Response) => {
    res.json({
        message: "Authenticated",
        user: (req as any).user
    });
});

routerUser.patch('/username', authenticateToken, changeUsername);
routerUser.patch('/password', authenticateToken, changePassword);
routerUser.patch('/profilepicture', authenticateToken, changeProfilePicture);
routerUser.post('/logout', logout);
routerUser.delete('/', authenticateToken, deleteUser);

export { routerUser };