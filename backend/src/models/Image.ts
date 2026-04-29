import { Schema, model } from "mongoose";
import { supabase } from "../config/supabase";
import { ImageInterface } from "../types";

const imageSchema = new Schema<ImageInterface>({
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

imageSchema.methods.getSignedUrl = async function () {
  const { data, error } = await supabase.storage
    .from("images")
    .createSignedUrl(this.filename, 60 * 60);

  if (error) {
    return null;
  }

  return data?.signedUrl;
};

export const Image = model<ImageInterface>("Image", imageSchema);