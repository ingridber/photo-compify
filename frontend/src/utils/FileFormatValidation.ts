export default function FileFormatValidation() {
    function validateFileFormat(file: File) {
    const type = file.type.toLowerCase();

    const allowedTypes = ["image/jpeg", "image/webp", "image/png"];

    if (!allowedTypes.includes(type)) {
        return `Invalid format: ${type}`;
    }

    return "";
    }

  return {
    validateFileFormat
  };
}