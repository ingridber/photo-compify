export function removeSpaces(file: File) {
    return new File(
      [file],
      file.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9.-]/g, ""),
      { type: file.type }
    );
}
