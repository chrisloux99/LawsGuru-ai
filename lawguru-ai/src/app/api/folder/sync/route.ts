import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateCheck = checkRateLimit(`folder-sync:${ip}`, RATE_LIMITS.sync);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many sync requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfter) },
      }
    );
  }

  try {
    const body = await request.json();
    const folderPath = sanitizeString(
      typeof body?.path === "string" ? body.path : "",
      500
    );

    if (!folderPath) {
      return NextResponse.json(
        { error: "Folder path is required" },
        { status: 400 }
      );
    }

    // Fail fast with a clean message before invoking Python
    const fs = await import("fs/promises");
    try {
      const stat = await fs.stat(folderPath);
      if (!stat.isDirectory() && !stat.isFile()) {
        return NextResponse.json(
          { error: `Path is not a file or folder: ${folderPath}` },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: `Path not found: ${folderPath}` },
        { status: 400 }
      );
    }

    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const path = await import("path");
    const execFileAsync = promisify(execFile);
    const pythonDir = path.join(process.cwd(), "python");

    try {
      const { stdout } = await execFileAsync(
        "python",
        [path.join(pythonDir, "folder_sync.py"), "--folder", folderPath],
        { cwd: process.cwd(), timeout: 600000 }
      );

      const result = JSON.parse(stdout);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    } catch (err) {
      // Python crashed (missing deps, Ollama down, etc.) — surface the
      // tail of stderr so the message is actionable.
      const stderr =
        err && typeof err === "object" && "stderr" in err
          ? String((err as { stderr?: string }).stderr || "")
          : "";
      const detail = stderr.trim().split("\n").slice(-3).join(" ").slice(0, 300);
      console.error("Folder sync error:", err);
      return NextResponse.json(
        {
          error: detail
            ? `Folder sync failed: ${detail}`
            : "Folder sync failed. Check that Python, turbovec and Ollama are available.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Folder sync error:", error);
    return NextResponse.json(
      { error: "Folder sync failed" },
      { status: 500 }
    );
  }
}
