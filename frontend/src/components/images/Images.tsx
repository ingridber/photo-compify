import { useEffect, useState } from "react";

type ImageItem = {
  _id: string;
  url: string;
  filename: string;
};

export default function Images() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("http://localhost:3000/api/v1/images");

        if (!res.ok) {
          throw new Error("Failed to fetch images");
        }

        const data = await res.json();

        console.log("IMAGES RESPONSE:", data);

        setImages(Array.isArray(data?.data) ? data.data : []);
      } catch (err: any) {
        console.log("ERROR:", err);
        setError(err.message);
      }
    }

    fetchImages();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Images</h2>

      {images.length === 0 && <p>No images found</p>}

      {images.map((img) => (
        <div key={img._id} style={{ marginBottom: 20 }}>
          <img
            src={img.url}
            alt={img.filename}
            width={200}
            style={{ cursor: "pointer" }}
            onClick={() => window.open(img.url, "_blank")}
          />

          <p><strong>filename:</strong> {img.filename}</p>
          <p><strong>imageId:</strong> {img._id}</p>
          <p><strong>url:</strong> {img.url}</p>
        </div>
      ))}
    </div>
  );
}