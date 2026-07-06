"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaSyncAlt,
  FaTrashAlt,
  FaFileAlt,
  FaFile,
  FaFileExcel,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaShieldAlt,
  FaDatabase,
  FaFolderOpen,
} from "react-icons/fa";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { IndexedDocument, SyncProgress, IndexStatus } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

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
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: "idle",
    current: 0,
    total: 0,
    message: "",
  });
  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [indexStatus, setIndexStatus] = useState<IndexStatus | null>(null);

  const handleConnect = async () => {
    window.location.href = "/api/drive/auth";
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncProgress({
      status: "syncing",
      current: 0,
      total: 0,
      message: "Connecting to Google Drive...",
    });

    try {
      const response = await fetch("/api/drive/sync", { method: "POST" });
      if (!response.ok) throw new Error("Sync failed");

      const result = await response.json();
      setDocuments(result.documents || []);
      setIndexStatus(result.status || null);
      setSyncProgress({
        status: "done",
        current: result.processed || 0,
        total: result.total || 0,
        message: `Synced ${result.processed || 0} documents`,
      });
    } catch {
      setSyncProgress({
        status: "error",
        current: 0,
        total: 0,
        message: "Sync failed. Check your Drive connection.",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fetch(`/api/documents?id=${fileId}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.driveFileId !== fileId));
    } catch {
      // silent fail
    }
  };

  return (
    <div className="flex min-h-screen kente-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-24 px-4 sm:px-8 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-8"
          >
            <h1 className="font-heading text-3xl font-extrabold text-earth-100 mb-2">
              Document Library
            </h1>
            <p className="text-earth-400 font-body">
              Connect your Google Drive to sync Zambian legal documents — case
              law, statutes, contracts, and legal opinions.
            </p>
          </motion.div>

          {/* Connection Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mb-8"
          >
            <Card>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center copper-glow">
                    <FaFolderOpen className="w-6 h-6 text-copper" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-earth-100">
                      Google Drive
                    </h3>
                    <p className="text-sm text-earth-400 font-body">
                      {connected
                        ? "Connected — ready to sync legal documents"
                        : "Not connected — connect to start indexing"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!connected ? (
                    <Button onClick={handleConnect} variant="copper">
                      Connect Drive
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        onClick={handleSync}
                        disabled={syncing}
                      >
                        {syncing ? (
                          <LoadingSpinner size={16} />
                        ) : (
                          <FaSyncAlt className="w-4 h-4 mr-2" />
                        )}
                        {syncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setConnected(false)}
                      >
                        Disconnect
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Sync Progress */}
              {syncProgress.status !== "idle" && (
                <div className="mt-4 pt-4 border-t border-earth-800/50">
                  <div className="flex items-center gap-3">
                    {syncProgress.status === "done" && (
                      <FaCheckCircle className="w-4 h-4 text-zambia-green" />
                    )}
                    {syncProgress.status === "error" && (
                      <FaExclamationCircle className="w-4 h-4 text-zambia-red" />
                    )}
                    {syncProgress.status === "syncing" && (
                      <FaClock className="w-4 h-4 text-gold animate-pulse" />
                    )}
                    <span className="text-sm text-earth-300 font-body">
                      {syncProgress.message}
                    </span>
                  </div>
                  {syncProgress.total > 0 && (
                    <div className="mt-2 h-1.5 rounded-full bg-earth-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (syncProgress.current / syncProgress.total) * 100
                          }%`,
                          background:
                            "linear-gradient(90deg, #B87333, #CA8A04)",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Index Status */}
          {indexStatus && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
            >
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
            </motion.div>
          )}

          {/* Data Sovereignty notice */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2.5}
            className="mb-8"
          >
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
          </motion.div>

          {/* Document List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <h2 className="font-heading text-xl font-bold text-earth-100 mb-4">
              Indexed Documents
              {documents.length > 0 && (
                <Badge variant="gold" className="ml-2">
                  {documents.length}
                </Badge>
              )}
            </h2>

            {documents.length === 0 ? (
              <Card className="text-center py-12">
                <FaFolderOpen className="w-12 h-12 text-earth-700 mx-auto mb-4" />
                <p className="text-earth-500 font-body mb-2">
                  No documents indexed yet
                </p>
                <p className="text-xs text-earth-600 font-body">
                  Connect your Google Drive and sync to start building your
                  Zambian legal knowledge base.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const Icon = mimeIcons[doc.mimeType] || File;
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.driveFileId)}
                        aria-label={`Delete ${doc.fileName}`}
                      >
                        <FaTrashAlt className="w-4 h-4" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
