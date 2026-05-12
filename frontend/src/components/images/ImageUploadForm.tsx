import { useRef, useState } from "react";
import "./ImageUploadForm.css";
import { uploadImage } from "../../services/imageApi";
import FileSizeValidation from "./FileSizeValidation";
import FileFormatValidation from "./FileFormatValidation";
import { updateProfilePicture, createSubmission } from "../../services/api";
import { getCurrentUser } from "../../services/api";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router";

type PictureProps = {
    pictureType? : string | null;
    competitionId?: string;
    onUploadSuccess?: () => void;
};

export default function ImageUploadForm({pictureType, competitionId, onUploadSuccess}: PictureProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const fileSizeRules = FileSizeValidation();
  const fileFormatRules = FileFormatValidation();

  const {user, setUser} = useUser();

  const navigate = useNavigate();

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setMessage("");

    if (!file) return;

    // format check
    const formatError = fileFormatRules.validateFileFormat(file);
    if (formatError) {
      setMessage(formatError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // size check
    const sizeError = fileSizeRules.validateFileSize(file);
    if (sizeError) {
      setMessage(sizeError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await uploadImage(formData);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // ----------------------------------------
      // ---------- HANDLE PROFILE PIC ----------
      // ----------------------------------------
      if(pictureType === 'profile') {
        await updateProfilePicture(
          data.data._id,
          user?.profilePicture?._id);

        const currentUser = await getCurrentUser();

        if (!currentUser) {
          throw new Error("No current User found")
        }

        setUser({
          _id: currentUser.data._id,
          username: currentUser.data.username,
          profilePicture: currentUser.data.profilePicture
        })

        if(onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 1000);
        }
      }
      // ----------------------------------------
      // ----------------------------------------
      // ----------------------------------------



      if(pictureType === 'submission' && competitionId) {
          try {
              await createSubmission(competitionId, data.data._id );
              setMessage("submission added");
              navigate(`/competitions/${competitionId}`);
              return;
          } catch (err) {
              setMessage(`submission failed: ${err}`);
              return;
          }
      }

      console.log("UPLOAD RESPONSE:", data);

      setMessage("Image uploaded successfully ✅");

      // reset
      setSelectedFile(null);
      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err: any) {
      console.log("UPLOAD ERROR:", err);
      setMessage(err.message || "Upload failed ❌");
    }
  };

  return (
    <div className="image-upload-form">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div className="upload-box" onClick={handleOpenFilePicker}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="preview"
            className="preview-image"
          />
        ) : (
          <div className="upload">
            <p className="upload-plus">+</p>
            <h2 className="upload-title">Upload Image</h2>
            <p className="upload-text">or drag & drop image here</p>
          </div>
        )}
      </div>

      <p className="upload-info">Max 1MB, JPG, PNG, WEBP</p>



      <button
        className={`upload-button ${selectedFile ? "active" : ""}`}
        onClick={handleUpload}
      >
        Upload
      </button>

      {message && (
        <p style={{ color: message.includes("success") ? "green" : "red" }} className="message">
          {message}
        </p>
      )}
    </div>
  );
}
