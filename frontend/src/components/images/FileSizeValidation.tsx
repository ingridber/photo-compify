export default function FileSizeValidation() {
  const maxSize = 1 * 1024 * 1024;

  function validateFileSize(file: File) {
    if (file.size > maxSize) {
      const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);

      return `The image is ${fileSizeInMB} MB, maximum allowed size is 1 MB`;
    }

    return "";
  }

  return {
    validateFileSize
  };
}