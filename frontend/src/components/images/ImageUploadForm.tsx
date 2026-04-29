import { useRef, useState } from "react";
import "./ImageUploadForm.css";
import { uploadImage } from "../../services/imageApi";
import FileSizeValidation from "./FileSizeValidation";
import FileFormatValidation from "./FileFormatValidation";

export default function ImageUploadForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const fileSizeRules = FileSizeValidation();
  const fileFormatRules = FileFormatValidation();

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setMessage("");

    if (!file) return;

    console.log(file.type);

    const formatError = fileFormatRules.validateFileFormat(file);
    if (formatError) {
      setMessage(formatError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

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
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("uploadedBy", "Delzar");
    formData.append("competitionId", "comp1");

    const response = await uploadImage(formData);
    const data = await response.json();

    console.log(data);
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
          <div>
            <p className="upload-plus">+</p>
            <h2 className="upload-title">Upload Image</h2>
            <p className="upload-text">or drag & drop image here</p>
          </div>
        )}
      </div>

      <p className="upload-info">Max 1MB, JPG, PNG, WEBP</p>

      {message && (
        <p style={{ color: "red" }}>
          {message}
        </p>
      )}

      <button
        className={`upload-button ${selectedFile ? "active" : ""}`}
        onClick={handleUpload}
      >
        Upload
      </button>
    </div>
  );
}