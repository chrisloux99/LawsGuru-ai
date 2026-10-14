"use client";

import { useState, useEffect } from "react";
import {
  FaFolderOpen,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "@/components/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const STORAGE_KEY = "lawguru-folder-path";

interface FolderSyncResult {
  total?: number;
  new?: number;
  updated?: number;
  unchanged?: number;
  pruned?: number;
  processed?: number;
  failed?: number;
  errors?: string[];
  error?: string;
}

interface LocalFolderCardProps {
  onSyncComplete: () => void;
}

export default function LocalFolderCard({
  onSyncComplete,
}: LocalFolderCardProps) {
  const [path, setPath] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<FolderSyncResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setPath(saved);
  }, []);

  const handleSync = async () => {
    if (!path.trim() || syncing) return;

    setSyncing(true);
    setErrorMsg("");
    setResult(null);

    try {
      localStorage.setItem(STORAGE_KEY, path.trim());
      const response = await fetch("/api/folder/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: path.trim() }),
      });

      const data: FolderSyncResult = await response.json();

      if (!response.ok || data.error) {
        setErrorMsg(data.error || "Folder sync failed.");
      } else {
        setResult(data);
        onSyncComplete();
      }
    } catch {
      setErrorMsg("Folder sync failed. Is the app server running?");
    } finally {
      setSyncing(false);
    }
  };

  const summary = result
    ? `Indexed ${result.processed ?? 0} document(s)` +
      ` — ${result.new ?? 0} new, ${result.updated ?? 0} updated,` +
      ` ${result.unchanged ?? 0} unchanged` +
      (result.failed ? `, ${result.failed} failed` : "")
    : "";

  return (
    <Card>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center copper-glow">
          <FaFolderOpen className="w-6 h-6 text-copper" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-earth-100">
            Local Folder
          </h3>
          <p className="text-sm text-earth-400 font-body">
            Index files and folders directly from this machine — no Google
            Drive needed
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSync();
          }}
          placeholder="e.g. C:\Users\you\Documents\contracts or /home/you/legal"
          disabled={syncing}
          className="flex-1 px-4 py-2.5 bg-earth-900/60 border border-earth-700 rounded-lg text-sm text-earth-200 placeholder:text-earth-600 focus:outline-none focus:border-copper/50 transition-colors disabled:opacity-50"
          aria-label="Folder path to index"
        />
        <Button onClick={handleSync} disabled={syncing || !path.trim()}>
          {syncing ? (
            <LoadingSpinner size={16} />
          ) : (
            <FaSyncAlt className="w-4 h-4 mr-2" />
          )}
          {syncing ? "Indexing..." : "Index Folder"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-earth-500 font-body">
        Scans the folder recursively for PDF, DOCX and TXT files. Re-running
        only indexes new or changed files.
      </p>

      {/* Sync Result / Error */}
      {(result || errorMsg) && (
        <div className="mt-4 pt-4 border-t border-earth-800/50">
          <div className="flex items-start gap-3">
            {result && (
              <FaCheckCircle className="w-4 h-4 text-zambia-green shrink-0 mt-0.5" />
            )}
            {errorMsg && (
              <FaExclamationCircle className="w-4 h-4 text-zambia-red shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <span className="text-sm text-earth-300 font-body">
                {result ? summary : errorMsg}
              </span>
              {result?.errors && result.errors.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {result.errors.slice(0, 5).map((e, i) => (
                    <li
                      key={i}
                      className="text-xs text-earth-500 font-body truncate"
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
