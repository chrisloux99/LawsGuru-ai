import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function GET() {
  try {
    const pythonDir = path.join(process.cwd(), "python");
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
