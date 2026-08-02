"use client";

import { useState, useCallback, useRef } from "react";
import { FaUpload, FaFileAlt, FaFile, FaTimes } from "@/components/icons";
import type { UploadProgress } from "@/types";

interface FileUploadZoneProps {
  onUploadComplete: () => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = ".pdf,.docx,.txt";

function getFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "";
}

function getMimeFromExt(name: string): string {
  const ext = getFileExtension(name);
  if (ext === "pdf") return "application/pdf";
  if (ext === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "txt") return "text/plain";
  return "";
}

function getFileIcon(name: string) {
  const ext = getFileExtension(name);
  if (ext === "pdf") return FaFileAlt;
  return FaFile;
}

export default function FileUploadZone({
  onUploadComplete,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): File[] => {
    return files.filter((file) => {
      const ext = getFileExtension(file.name);
      const validExts = ["pdf", "docx", "txt"];
      if (!validExts.includes(ext)) return false;
      if (file.size > 50 * 1024 * 1024) return false;
      return true;
    });
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const validFiles = validateFiles(files);
      if (validFiles.length === 0) return;

      const newUploads: UploadProgress[] = validFiles.map((file) => ({
        file,
        status: "pending" as const,
        progress: 0,
      }));

      setUploads(newUploads);
      setIsUploading(true);

      // Upload all files in one request
      const formData = new FormData();
      validFiles.forEach((file) => formData.append("files", file));

      // Mark all as processing
      setUploads((prev) =>
        prev.map((u) => ({ ...u, status: "processing" as const, progress: 50 }))
      );

      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();

        // Update upload statuses based on results
        setUploads((prev) =>
          prev.map((u, i) => {
            const r = result.results?.[i];
            if (r?.status === "indexed") {
              return { ...u, status: "indexed" as const, progress: 100 };
            }
            return {
              ...u,
              status: "error" as const,
              progress: 100,
              error: r?.error || "Processing failed",
            };
          })
        );

        onUploadComplete();
      } catch {
        setUploads((prev) =>
          prev.map((u) => ({
            ...u,
            status: "error" as const,
            error: "Upload failed",
          }))
        );
      } finally {
        setIsUploading(false);
      }
    },
    [validateFiles, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFiles]
  );

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  const hasCompletedUploads = uploads.some(
    (u) => u.status === "indexed" || u.status === "error"
  );

  return (
    <div>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
          ${
            isDragOver
              ? "border-copper bg-copper/10 scale-[1.01]"
              : "border-earth-700 hover:border-copper/50 hover:bg-earth-900/30"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              isDragOver
                ? "bg-copper/20 text-copper"
                : "bg-earth-800 text-earth-500"
            }`}
          >
            <FaUpload className="w-5 h-5" />
          </div>
          <p className="font-heading text-sm font-bold text-earth-200 mb-1">
            {isDragOver
              ? "Drop files here"
              : "Drag & drop files or click to browse"}
          </p>
          <p className="text-xs text-earth-500 font-body">
            PDF, DOCX, TXT — up to 50MB each
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload documents"
        />
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploads.map((upload, i) => {
            const Icon = getFileIcon(upload.file.name);
            return (
              <div
                key={i}
                className="glass-panel p-3 flex items-center gap-3"
              >
                <Icon className="w-4 h-4 text-earth-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-earth-200 font-body truncate">
                    {upload.file.name}
                  </p>
                  {upload.status === "processing" && (
                    <div className="mt-1.5 h-1 rounded-full bg-earth-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-copper to-gold transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.status === "indexed" && (
                    <p className="text-xs text-zambia-green mt-0.5">
                      Indexed successfully
                    </p>
                  )}
                  {upload.status === "error" && (
                    <p className="text-xs text-zambia-red mt-0.5">
                      {upload.error || "Failed"}
                    </p>
                  )}
                </div>
                {upload.status === "indexed" && (
                  <span className="text-xs text-zambia-green font-medium">
                    Done
                  </span>
                )}
              </div>
            );
          })}

          {hasCompletedUploads && (
            <button
              onClick={clearUploads}
              className="text-xs text-earth-500 hover:text-earth-300 transition-colors flex items-center gap-1"
            >
              <FaTimes className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
