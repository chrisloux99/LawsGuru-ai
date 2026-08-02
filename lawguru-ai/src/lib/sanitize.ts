export function sanitizeString(input: string, maxLength = 10000): string {
  return input
    .replace(/\0/g, "") // Remove null bytes
    .trim()
    .slice(0, maxLength);
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\-\s]/g, "") // Only allow safe chars
    .replace(/\s+/g, "_") // Spaces to underscores
    .replace(/\.{2,}/g, ".") // No double dots
    .replace(/^\./, "") // No leading dot
    .slice(0, 200);
}

export function isValidFileType(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["pdf", "docx", "txt"].includes(ext || "");
}

export function isValidFileSize(size: number, maxMB = 50): boolean {
  return size > 0 && size <= maxMB * 1024 * 1024;
}
