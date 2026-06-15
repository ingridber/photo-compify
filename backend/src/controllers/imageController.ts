import { Response } from "express";
import { AuthRequest } from "../types";
import { supabase } from "../config/supabase";
import { Image } from "../models/Image";
import { validateImage } from "../services/sightengine";



// POST - CREATE IMAGE
export async function createImage(req: AuthRequest, res: Response) {
  let uploadedPath: string | null = null;

  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        message: "Image file is required"
      });
    }
    const sightengineResult = await validateImage(imageFile);

    if (!sightengineResult.approved) {
      return res.status(400).json({
        message: "Image violates content policy",
        reason: sightengineResult.reason,
      });
    }
    const fileName = `${Date.now()}-${imageFile.originalname}`;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, imageFile.buffer, {
        contentType: imageFile.mimetype
      });

    if (error) {
      return res.status(500).json({
        message: "Failed to upload image",
      });
    }

    uploadedPath = data.path;
    const userId = req.user?.id;

    //console.log("USER ID:", userId);


    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }
    const savedImage = await Image.create({
      filename: data.path,
      fileSize: imageFile.size,
      fileFormat: imageFile.mimetype,
      uploadedAt: new Date(),
      uploadedBy: userId
    });
    //console.log(savedImage);

    return res.status(201).json({
      message: "Image uploaded successfully",
      data: {
        _id: savedImage._id,
        filename: savedImage.filename,
      }
    });

  } catch (error: any) {
    console.log("CREATE IMAGE ERROR:", error);
    
    if (uploadedPath) {
      const { error: cleanupError } = await supabase.storage
      .from("images")
      .remove([uploadedPath]);

      if (cleanupError) {
        console.error("Failed to clean up orphaned file:", cleanupError.message);
      }
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
}

// DELETE IMAGE
export async function deleteImage(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }

    if (image.uploadedBy?.toString() !== userId) {
      return res.status(403).json({
        message: "You can only delete your own images"
      });
    }

    await Image.findByIdAndDelete(id);

    const { error } = await supabase.storage
      .from("images")
      .remove([image.filename]);

    if (error) {
      await Image.create({ ...image.toObject() });

      return res.status(500).json({
        message: "Failed to delete image",
      });
    }

    return res.status(200).json({
      message: "Image deleted successfully"
    });

  } catch (error: any) {
    console.log("DELETE IMAGE ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete image",
    });
  }
}

// PATCH
export async function updateImage(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }

    if (image.uploadedBy?.toString() !== userId) {
      return res.status(403).json({
        message: "You can only update your own images"
      });
    }

    await image.save();

    return res.status(200).json({
      message: "Image updated",
      data: image
    });

  } catch (error: any) {
    console.log("UPDATE IMAGE ERROR:", error);

    return res.status(500).json({
      message: "Failed to update image",
    });
  }
}
