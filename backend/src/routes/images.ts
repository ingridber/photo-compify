import express from "express";
import { createImage,deleteImage,updateImage} from "../controllers/imageController";
import { upload } from "../middleware/uploadMiddleware";
import { uploadRateLimit } from "../middleware/rateLimitImage";
import { checkFileSize } from "../middleware/checkFileSize";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();
router.post("/", authenticateToken, uploadRateLimit, upload.single("image"), checkFileSize, createImage);
router.delete("/:id", authenticateToken, deleteImage);
// router.delete("/:id", requireRole(["admin"]), deleteImage); LÄGG TILLBAKA
router.patch("/:id", authenticateToken, updateImage);

export default router;
