import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const execFileAsync = promisify(execFile);

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\-\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 200);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const docId = searchParams.get("id");
    const pythonDir = path.join(process.cwd(), "python");

    // Get chunks for a specific document
    if (action === "chunks" && docId) {
      const { stdout } = await execFileAsync(
        "python",
        [path.join(pythonDir, "vector_store.py"), "--chunks", docId],
        { cwd: process.cwd(), timeout: 10000 }
      );
      const data = JSON.parse(stdout);
      return NextResponse.json(data);
    }

    // List all documents
    const { stdout } = await execFileAsync(
      "python",
      [path.join(pythonDir, "vector_store.py"), "--list"],
      { cwd: process.cwd(), timeout: 10000 }
    );

    const documents = JSON.parse(stdout);
    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json({ documents: [] });
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateCheck = checkRateLimit(`upload:${ip}`, RATE_LIMITS.upload);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfter) },
      }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "data", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const results: Array<{
      fileName: string;
      status: string;
      chunks?: number;
      error?: string;
    }> = [];

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.has(file.type)) {
        results.push({
          fileName: file.name,
          status: "error",
          error: `Unsupported file type: ${file.type}. Allowed: PDF, DOCX, TXT`,
        });
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        results.push({
          fileName: file.name,
          status: "error",
          error: `File too large (max 50MB)`,
        });
        continue;
      }

      // Save file to disk
      const sanitizedName = sanitizeFilename(file.name);
      const fileId = crypto.randomUUID();
      const filePath = path.join(uploadDir, `${fileId}_${sanitizedName}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      try {
        // Process and index the file via Python
        const pythonDir = path.join(process.cwd(), "python");
        const { stdout } = await execFileAsync(
          "python",
          [
            path.join(pythonDir, "doc_processor.py"),
            "--process",
            filePath,
            file.type,
            fileId,
            file.name,
          ],
          { cwd: process.cwd(), timeout: 60000 }
        );

        const processResult = JSON.parse(stdout);
        results.push({
          fileName: file.name,
          status: "indexed",
          chunks: processResult.chunks || 0,
        });
      } catch (err) {
        results.push({
          fileName: file.name,
          status: "error",
          error: err instanceof Error ? err.message : "Processing failed",
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("id");

    if (!docId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const pythonDir = path.join(process.cwd(), "python");
    await execFileAsync(
      "python",
      [path.join(pythonDir, "vector_store.py"), "--remove", docId],
      { cwd: process.cwd(), timeout: 10000 }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
