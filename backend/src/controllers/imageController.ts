import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { Image } from "../models/Image";


// POST - CREATE IMAGE
export async function createImage(req: Request, res: Response) {
  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        message: "Image file is required"
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
        message: "Failed to upload image to Supabase",
        error: error.message
      });
    }

    const savedImage = await Image.create({
      filename: data.path,
      fileSize: imageFile.size,
      fileFormat: imageFile.mimetype,
      uploadedAt: new Date()
    });
    
    console.log("saved image id", savedImage._id);
    return res.status(201).json({
      message: "Image uploaded successfully",
      data: {
        _id: savedImage._id,
        filename: savedImage.filename,
      }
    });

  } catch (error: any) {
    console.log("CREATE IMAGE ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}
// GET ALL
export async function getAllImages(req: Request, res: Response) {
  try {
    const images = await Image.find();

    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        const signedUrl = await image.getSignedUrl();

        return {
          ...image.toObject(),
          url: signedUrl
        };
      })
    );

    return res.status(200).json({
      data: imagesWithUrls
    });

  } catch (error: any) {
    console.log("GET IMAGES ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch images",
      error: error.message
    });
  }
}

// GET BY ID
export async function getImageById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }

    const signedUrl = await image.getSignedUrl();

    return res.status(200).json({
      ...image.toObject(),
      url: signedUrl
    });

  } catch (error: any) {
    console.log("GET IMAGE BY ID ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch image",
      error: error.message
    });
  }
}

// DELETE IMAGE
export async function deleteImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }

    const { error } = await supabase.storage
      .from("images")
      .remove([image.filename]);

    if (error) {
      return res.status(500).json({
        message: "Failed to delete from Supabase",
        error: error.message
      });
    }

    await Image.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Image deleted successfully"
    });

  } catch (error: any) {
    console.log("DELETE IMAGE ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete image",
      error: error.message
    });
  }
}

// PATCH
export async function updateImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found"
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
      error: error.message
    });
  }
}

// TEST SUPABASE
export async function testSupabase(req: Request, res: Response) {
  try {
    const { data, error } = await supabase.storage
      .from("images")
      .list();

    if (error) {
      return res.status(500).json({
        message: "Supabase connection failed",
        error: error.message
      });
    }

    return res.status(200).json({
      message: "Supabase connected",
      data
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}
