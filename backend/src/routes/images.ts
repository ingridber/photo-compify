import express from "express";
import { getAllImages, getImageById, createImage,deleteImage,updateImage} from "../controllers/imageController";
import { upload } from "../middleware/uploadMiddleware";
import { testSupabase } from "../controllers/imageController";
import { uploadRateLimit } from "../middleware/rateLimitImage";
import { checkFileSize } from "../middleware/checkFileSize";

const router = express.Router();

router.get("/", getAllImages);
router.get("/test-supabase", testSupabase);
router.get("/:id", getImageById);
router.post("/", uploadRateLimit, upload.single("image"), checkFileSize, createImage);
router.delete("/:id", deleteImage);
router.patch("/:id", updateImage);

export default router;