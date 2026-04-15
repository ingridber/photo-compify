import express from "express";
import { getAllImages, getImageById, createImage,deleteImage,updateImage } from "../controllers/imageController";

const router = express.Router();

router.get("/", getAllImages);
router.get("/:id", getImageById);
router.post("/", createImage);
router.delete("/:id", deleteImage);
router.patch("/:id", updateImage);

export default router;