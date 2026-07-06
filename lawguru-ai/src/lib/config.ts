export const config = {
  llm: {
    apiBase: process.env.LLM_API_BASE || "http://localhost:11434/v1",
    apiKey: process.env.LLM_API_KEY || "",
    model: process.env.LLM_MODEL || "mimo-v2.5-pro",
  },
  embeddings: {
    host: process.env.OLLAMA_HOST || "http://localhost:11434",
    model: process.env.EMBED_MODEL || "nomic-embed-text",
  },
  drive: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/api/drive/auth/callback",
    folderId: process.env.DRIVE_FOLDER_ID || "",
  },
  app: {
    dataDir: process.env.DATA_DIR || "./data",
  },
} as const;
