import { Request, Response } from "express";
import { mockImages } from "../mock/imagesMock";
import { supabase } from "../config/supabase";
import { Image } from "../models/Image";

// GET ALL
export async function getAllImages(req: Request, res: Response) {
  try {
    const images = await Image.find();

    return res.status(200).json({
      data: images
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch images"
    });
  }
}

// GET BY ID
export function getImageById(req: Request, res: Response) {
  const { id } = req.params;
  const image = mockImages.find(img => img.id === id);

  if (!image) {
    return res.status(404).json({
      message: "Image not found"
    });
  }

  res.status(200).json(image);
}

// POST - CREATE IMAGE
export async function createImage(req: Request, res: Response) {
  try {
    const { uploadedBy } = req.body;
    const imageFile = req.file;

    if (!imageFile || !uploadedBy) {
      return res.status(400).json({
        message: "Image file and uploadedBy are required"
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

    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    const newImage = {
      id: `img${mockImages.length + 1}`,
      url: publicUrlData.publicUrl,
      uploadedBy,
      uploadedAt: new Date().toISOString()
    };

    await Image.create({
      url: publicUrlData.publicUrl,
      uploadedBy,
      filename: fileName,
      fileSize: imageFile.size,
      fileFormat: imageFile.mimetype,
      uploadedAt: new Date()
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      data: newImage
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
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

    await Image.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Image deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete image"
    });
  }
}

// PATCH - UPDATE IMAGE
export function updateImage(req: Request, res: Response) {
  const { id } = req.params;
  const image = mockImages.find(img => img.id === id);

  if (!image) {
    return res.status(404).json({
      message: "Image not found"
    });
  }

  const { url, uploadedBy } = req.body;

  if (url) image.url = url;
  if (uploadedBy) image.uploadedBy = uploadedBy;

  res.status(200).json({
    message: "Image updated",
    data: image
  });
}

// GET - TEST SUPABASE CONNECTION
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
      message: "Supabase connected successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
}