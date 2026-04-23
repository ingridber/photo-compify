import { Request, Response } from "express";
import { mockImages } from "../mock/imagesMock";
import { supabase } from "../config/supabase";
import { Image } from "../models/Image";

// GET ALL
export async function getAllImages(req: Request, res: Response) {
  try {
    const images = await Image.find();

    const imagesWithFreshUrl = await Promise.all(
      images.map(async (image) => {
        const { data, error } = await supabase.storage
          .from("images")
          .createSignedUrl(image.filename, 60 * 60);

        return {
          ...image.toObject(),
          url: error ? null : data?.signedUrl
        };
      })
    );

    return res.status(200).json({
      data: imagesWithFreshUrl
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch images"
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

    const { data, error } = await supabase.storage
      .from("images")
      .createSignedUrl(image.filename, 60 * 60);

    return res.status(200).json({
      ...image.toObject(),
      url: error ? null : data?.signedUrl
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch image"
    });
  }
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
      // console.log("UPLOAD DATA:", data);
      // console.log("FILE NAME:", fileName);
      // console.log("UPLOAD ERROR:", error);

    if (error) {
      return res.status(500).json({
        message: "Failed to upload image to Supabase",
        error: error.message
      });
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("images")
      .createSignedUrl(fileName, 60 * 60)

    if (signedUrlError) {
      return res.status(500).json({
        message: "Failed to create signed URL",
        error: signedUrlError.message
      });
    }

    const newImage = {
      id: `img${mockImages.length + 1}`,
      url: signedUrlData.signedUrl,
      uploadedBy,
      uploadedAt: new Date().toISOString()
    };

    await Image.create({
      url: signedUrlData.signedUrl,
      uploadedBy,
      filename: data.path,
      fileSize: imageFile.size,
      fileFormat: imageFile.mimetype,
      uploadedAt: new Date()
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      data: newImage
    });

  } catch (error: any) {
    // console.log("FULL ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
      details: error.errors
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
        message: "Failed to delete image from Supabase",
        error: error.message
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
export async function updateImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { uploadedBy } = req.body;

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }

    if (uploadedBy) {
      image.uploadedBy = uploadedBy;
    }

    await image.save();

    return res.status(200).json({
      message: "Image updated",
      data: image
    });

  } catch (error: any) {
    console.log("PATCH ERROR:", error);

    return res.status(500).json({
      message: "Failed to update image",
      error: error.message
    });
  }
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