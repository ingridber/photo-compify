import { changeUsername, changePassword, logout, deleteUser, changeProfilePicture } from "../controllers/usersControllers";
import express from "express";

const routerUser = express.Router()

routerUser.patch(`/username`, changeUsername);
routerUser.patch(`/password`, changePassword);
routerUser.patch('/profilepicture', changeProfilePicture);
routerUser.post(`/logout`, logout);
routerUser.delete(`/`, deleteUser);

export {routerUser};