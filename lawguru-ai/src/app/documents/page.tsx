"use client";

import { useState, useEffect } from "react";
import { applyPreferences, getPreferences } from "@/lib/preferences";
import {
  FaTrashAlt,
  FaFileAlt,
  FaFile,
  FaFileExcel,
  FaShieldAlt,
  FaDatabase,
  FaFolderOpen,
  FaSearch,
  FaTimes,
} from "@/components/icons";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { DocumentCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import FileUploadZone from "@/components/documents/FileUploadZone";
import GoogleDriveCard from "@/components/documents/GoogleDriveCard";
import type { IndexedDocument, IndexStatus } from "@/types";

const mimeIcons: Record<string, typeof FaFileAlt> = {
  "application/pdf": FaFileAlt,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    FaFileExcel,
  "text/plain": FaFile,
  "application/vnd.google-apps.document": FaFileAlt,
};

function getMimeLabel(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("wordprocessingml") || mime.includes("docx")) return "DOCX";
  if (mime.includes("plain")) return "TXT";
  if (mime.includes("google-apps")) return "Google Doc";
  return "Document";
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [indexStatus, setIndexStatus] = useState<IndexStatus | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [previewChunks, setPreviewChunks] = useState<
    Array<{ id: string; text: string; chunkIndex: number }>
  >([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const [docRes, statusRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/index/status"),
      ]);
      if (docRes.ok) {
        const data = await docRes.json();
        setDocuments(data.documents || []);
      }
      if (statusRes.ok) {
        const data = await statusRes.json();
        setIndexStatus(data || null);
      }
    } catch {
      // Silently fail — shows empty state
    } finally {
      setLoading(false);
    }
  };

  // Load documents on mount & apply preferences
  useEffect(() => {
    applyPreferences(getPreferences());
    fetchDocuments();
  }, []);

  // Filter documents by search and type
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.fileName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (typeFilter === "all") return matchesSearch;
    const mime = doc.mimeType;
    if (typeFilter === "pdf") return matchesSearch && mime.includes("pdf");
    if (typeFilter === "docx")
      return matchesSearch && mime.includes("wordprocessingml");
    if (typeFilter === "txt") return matchesSearch && mime.includes("plain");
    if (typeFilter === "gdoc")
      return matchesSearch && mime.includes("google-apps");
    return matchesSearch;
  });

  const handlePreview = async (docId: string) => {
    setPreviewDoc(docId);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/documents?id=${docId}&action=chunks`);
      if (res.ok) {
        const data = await res.json();
        setPreviewChunks(data.chunks || []);
      }
    } catch {
      setPreviewChunks([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/documents?id=${fileId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setDocuments((prev) => prev.filter((d) => d.driveFileId !== fileId));
      toast.success("Document removed from index");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex min-h-screen kente-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-8 px-4 sm:px-8 pb-12">
        <ErrorBoundary>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="animate-fade-in-up delay-0 mb-8">
            <h1 className="font-heading text-3xl font-extrabold text-earth-100 mb-2">
              Document Library
            </h1>
            <p className="text-earth-400 font-body">
              Upload documents from your computer or connect Google Drive to
              build your Zambian legal knowledge base.
            </p>
          </div>

          {/* Local File Upload */}
          <div className="animate-fade-in-up delay-1 mb-8">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center copper-glow">
                  <FaFolderOpen className="w-5 h-5 text-copper" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-earth-100">
                    Upload from Computer
                  </h3>
                  <p className="text-sm text-earth-400 font-body">
                    Upload PDF, DOCX, or TXT files directly
                  </p>
                </div>
              </div>
              <FileUploadZone onUploadComplete={fetchDocuments} />
            </Card>
          </div>

          {/* Google Drive Connection */}
          <div className="animate-fade-in-up delay-1 mb-8">
            <GoogleDriveCard onSyncComplete={fetchDocuments} />
          </div>

          {/* Index Status */}
          {indexStatus && (
            <div className="animate-fade-in-up delay-2 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Documents",
                  value: indexStatus.totalDocuments,
                  icon: FaFileAlt,
                },
                {
                  label: "Vectors",
                  value: indexStatus.totalVectors,
                  icon: FaDatabase,
                },
                { label: "Dimensions", value: indexStatus.dim, icon: null },
                {
                  label: "Index Size",
                  value: indexStatus.indexSize,
                  icon: null,
                },
              ].map((stat) => (
                <Card key={stat.label} className="text-center">
                  <p className="text-2xl font-heading font-extrabold text-gold">
                    {stat.value}
                  </p>
                  <p className="text-xs text-earth-500 font-body mt-1">
                    {stat.label}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* Data Sovereignty notice */}
          <div className="animate-fade-in-up delay-2 mb-8">
            <div className="glass-panel p-4 flex items-start gap-3">
              <FaShieldAlt className="w-5 h-5 text-zambia-green shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-body text-earth-300">
                  <span className="font-semibold text-earth-200">
                    Data Sovereignty Guarantee
                  </span>{" "}
                  — All documents are processed and stored locally on your
                  machine. No legal data is sent to external servers. Your
                  firm&apos;s legal strategy remains confidential.
                </p>
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="animate-fade-in-up delay-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="font-heading text-xl font-bold text-earth-100">
                Indexed Documents
                {documents.length > 0 && (
                  <Badge variant="gold" className="ml-2">
                    {filteredDocuments.length}
                  </Badge>
                )}
              </h2>
              {documents.length > 0 && (
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-500" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-8 py-2 bg-earth-900/60 border border-earth-700 rounded-lg text-sm text-earth-200 placeholder:text-earth-600 focus:outline-none focus:border-copper/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-earth-500 hover:text-earth-300"
                    >
                      <FaTimes className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Type Filters */}
            {documents.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { key: "all", label: "All" },
                  { key: "pdf", label: "PDF" },
                  { key: "docx", label: "DOCX" },
                  { key: "txt", label: "TXT" },
                  { key: "gdoc", label: "Google Docs" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setTypeFilter(filter.key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      typeFilter === filter.key
                        ? "bg-copper/20 text-copper border-copper/40"
                        : "bg-earth-900/40 text-earth-500 border-earth-700 hover:border-earth-600"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                <DocumentCardSkeleton />
                <DocumentCardSkeleton />
                <DocumentCardSkeleton />
              </div>
            ) : documents.length === 0 ? (
              <EmptyState
                icon={FaFolderOpen}
                title="No documents indexed yet"
                description="Upload files from your computer or connect Google Drive to start building your Zambian legal knowledge base."
              />
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => {
                  const Icon = mimeIcons[doc.mimeType] || FaFile;
                  const isConfirming = deleteConfirm === doc.driveFileId;
                  return (
                    <Card
                      key={doc.driveFileId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-tertiary border border-earth-700 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-earth-400" />
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium text-earth-200">
                            {doc.fileName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="copper">
                              {getMimeLabel(doc.mimeType)}
                            </Badge>
                            {doc.source === "local" && (
                              <Badge variant="green">Local</Badge>
                            )}
                            <span className="text-xs text-earth-500">
                              {doc.chunkCount} chunks
                            </span>
                            <span className="text-xs text-earth-600">
                              Indexed{" "}
                              {new Date(doc.indexedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.driveFileId)}
                            className="text-zambia-red hover:text-zambia-red"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(doc.driveFileId)}
                            aria-label={`Preview ${doc.fileName}`}
                          >
                            <FaFileAlt className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(doc.driveFileId)}
                            aria-label={`Delete ${doc.fileName}`}
                          >
                            <FaTrashAlt className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </ErrorBoundary>

        {/* Document Preview Modal */}
        {previewDoc && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setPreviewDoc(null);
              setPreviewChunks([]);
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative glass-panel max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-earth-800/50">
                <h3 className="font-heading text-lg font-bold text-earth-100">
                  Document Preview
                </h3>
                <button
                  onClick={() => {
                    setPreviewDoc(null);
                    setPreviewChunks([]);
                  }}
                  className="text-earth-400 hover:text-earth-200 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {previewLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="shimmer h-20 rounded-lg" />
                    ))}
                  </div>
                ) : previewChunks.length === 0 ? (
                  <p className="text-earth-500 text-sm text-center py-8">
                    No chunks found for this document.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {previewChunks.map((chunk) => (
                      <div
                        key={chunk.id}
                        className="p-3 bg-earth-900/40 rounded-lg border border-earth-800/50"
                      >
                        <p className="text-xs text-earth-500 mb-1">
                          Chunk {chunk.chunkIndex + 1}
                        </p>
                        <p className="text-sm text-earth-300 font-body leading-relaxed">
                          {chunk.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
