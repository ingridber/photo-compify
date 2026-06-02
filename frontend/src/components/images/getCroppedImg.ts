export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any
) {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No canvas context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Canvas is empty");
      }

      const file = new File([blob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      resolve(file);
    }, "image/jpeg");
  });
}