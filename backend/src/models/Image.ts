import { Schema, model } from "mongoose";
import { ImageInterface } from "../types";

const imageSchema = new Schema<ImageInterface>({
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  fileSize: {
   type: Number,
   required: true,
   max: 1048576
  },

  fileFormat: {
   type: String,
   required: true
  }
});

export const Image = model<ImageInterface>("Image", imageSchema);