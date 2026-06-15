import { Router } from "express";
import { getUserNotifications, markAsRead } from "../controllers/notificationController";
import { authenticateToken } from "../middleware/auth"; 

const router = Router();

router.use(authenticateToken);

router.get("/", getUserNotifications);

router.patch("/:id/read", markAsRead);

export default router;