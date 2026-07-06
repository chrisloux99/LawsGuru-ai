import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

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
  } catch (error) {
    console.error("Drive sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
