import { useState } from "react";

export default function ImageUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    setMessage("");

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedFile) {
      setMessage("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("uploadedBy", "delzar");

    try {
      const response = await fetch("http://localhost:3000/api/v1/images", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage(data.message);
      setSelectedFile(null);
      setPreview(null);

    } catch (error) {
      setMessage("Server connection failed.");
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        onChange={handleFileChange}
      />

      {preview && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "300px",
              borderRadius: "10px"
            }}
          />
        </div>
      )}

      <button type="submit">
        Upload Image
      </button>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </form>
  );
}