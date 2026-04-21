import { 
    changeUsername, 
    changePassword, 
    logout, 
    deleteUser, 
    changeProfilePicture 
} from "../controllers/usersControllers";
import { authenticateToken } from "../middleware/auth";
import express from "express";

const routerUser = express.Router();

routerUser.get("/profile", authenticateToken, (req, res) => {
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