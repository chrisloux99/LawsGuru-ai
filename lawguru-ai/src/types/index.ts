export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    driveFileId: string;
    fileName: string;
    mimeType: string;
    chunkIndex: number;
    pageCount?: number;
    uploadDate: string;
  };
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
}

export interface IRACResponse {
  issue: string;
  rule: string;
  application: string;
  conclusion: string;
  sources: SearchResult[];
  raw: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  irac?: IRACResponse;
  timestamp: Date;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

export interface IndexedDocument {
  driveFileId: string;
  fileName: string;
  mimeType: string;
  chunkCount: number;
  indexedAt: string;
  lastModified: string;
}

export interface IndexStatus {
  totalVectors: number;
  totalDocuments: number;
  dim: number;
  bitWidth: number;
  indexSize: string;
}

export interface SyncProgress {
  status: "idle" | "syncing" | "processing" | "indexing" | "done" | "error";
  current: number;
  total: number;
  message: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
