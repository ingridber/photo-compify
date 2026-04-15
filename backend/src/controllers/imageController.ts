import { Request, Response } from "express";
import { mockImages } from "../mock/imagesMock";

// GET ALL
export function getAllImages(req: Request, res: Response) {
  res.status(200).json({ data: mockImages });
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
export function createImage(req: Request, res: Response) {
  const { url, uploadedBy } = req.body;

  if (!url || !uploadedBy) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }

  const newImage = {
    id: `img${mockImages.length + 1}`,
    url,
    uploadedBy,
    uploadedAt: new Date().toISOString()
  };

  mockImages.push(newImage);

  res.status(201).json(newImage);
}

// DELETE IMAGE
export function deleteImage(req: Request, res: Response) {
  const { id } = req.params;

  const index = mockImages.findIndex(img => img.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Image not found"
    });
  }

  mockImages.splice(index, 1);

  res.status(204).send();
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