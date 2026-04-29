export default function FileFormatValidation() {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  function validateFileFormat(file: File) {
    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, PNG and WEBP files are allowed";
    }

    return "";
  }

  return {
    validateFileFormat
  };
}