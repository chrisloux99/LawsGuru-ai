"use client";

import { useState, useEffect } from "react";
import { FaFolderOpen, FaSyncAlt, FaCheckCircle } from "@/components/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { SyncProgress } from "@/types";

interface GoogleDriveCardProps {
  onSyncComplete: () => void;
}

export default function GoogleDriveCard({
  onSyncComplete,
}: GoogleDriveCardProps) {
  const [configured, setConfigured] = useState(false);
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: "idle",
    current: 0,
    total: 0,
    message: "",
  });

  useEffect(() => {
    // Check Drive connection status
    fetch("/api/drive/status")
      .then((res) => res.json())
      .then((data) => {
        setConfigured(data.configured);
        setConnected(data.connected);
      })
      .catch(() => {
        setConfigured(false);
        setConnected(false);
      })
      .finally(() => setChecking(false));

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      setConnected(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnect = () => {
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
      setSyncProgress({
        status: "done",
        current: result.processed || 0,
        total: result.total || 0,
        message: `Synced ${result.processed || 0} documents`,
      });
      onSyncComplete();
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

  const handleDisconnect = () => {
    setConnected(false);
    setSyncProgress({ status: "idle", current: 0, total: 0, message: "" });
  };

  if (checking) {
    return (
      <Card>
        <div className="flex items-center gap-4 py-2">
          <LoadingSpinner size={20} />
          <span className="text-sm text-earth-400 font-body">
            Checking Drive connection...
          </span>
        </div>
      </Card>
    );
  }

  return (
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
              {!configured
                ? "Setup required — add your Google API credentials"
                : connected
                  ? "Connected — ready to sync legal documents"
                  : "Not connected — sign in to start indexing"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!configured ? (
            <div className="text-right">
              <p className="text-xs text-earth-500 font-body mb-2">
                Add GOOGLE_CLIENT_ID to your .env.local
              </p>
              <Button variant="secondary" disabled>
                Setup Required
              </Button>
            </div>
          ) : !connected ? (
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-white text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
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
              <Button variant="ghost" onClick={handleDisconnect}>
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
              <FaFolderOpen className="w-4 h-4 text-zambia-red" />
            )}
            {syncProgress.status === "syncing" && (
              <LoadingSpinner size={14} />
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
                  background: "linear-gradient(90deg, #B87333, #CA8A04)",
                }}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
