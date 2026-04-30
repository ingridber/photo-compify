export async function getImages() {
  const res = await fetch("http://localhost:3000/api/v1/images");

  if (!res.ok) {
    throw new Error("Failed to fetch images");
  }

  const data = await res.json();

  return data.data;
}