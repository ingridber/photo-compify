import express from "express";
import { getAllImages, getImageById, createImage,deleteImage,updateImage} from "../controllers/imageController";
import { upload } from "../middleware/uploadMiddleware";
import { uploadRateLimit } from "../middleware/rateLimitImage";
import { checkFileSize } from "../middleware/checkFileSize";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// TODO: add auth på routes som används, rensa övriga
router.get("/", getAllImages);
// router.get("/test-supabase", testSupabase);
router.get("/:id", getImageById);
router.post("/", authenticateToken, uploadRateLimit, upload.single("image"), checkFileSize, createImage);
router.delete("/:id", authenticateToken, deleteImage);
router.patch("/:id", authenticateToken, updateImage);

export default router;
