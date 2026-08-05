import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookies = request.cookies.get("gdrive_tokens");
    if (!cookies) {
      return NextResponse.json(
        { error: "Google Drive not connected" },
        { status: 401 }
      );
    }

    const tokens = JSON.parse(cookies.value);
    const folderId = process.env.DRIVE_FOLDER_ID || "";

    try {
      const { execFile } = await import("child_process");
      const { promisify } = await import("util");
      const path = await import("path");
      const execFileAsync = promisify(execFile);
      const pythonDir = path.join(process.cwd(), "python");

      const { stdout } = await execFileAsync(
        "python",
        [
          path.join(pythonDir, "drive_sync.py"),
          "--tokens",
          JSON.stringify(tokens),
          "--folder-id",
          folderId,
        ],
        { cwd: process.cwd(), timeout: 300000 }
      );

      const result = JSON.parse(stdout);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({
        error: "Drive sync is not available in this deployment. Run locally with Python for document sync.",
      });
    }
  } catch (error) {
    console.error("Drive sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
