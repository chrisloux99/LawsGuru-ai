import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const path = await import("path");
    const execFileAsync = promisify(execFile);
    const pythonDir = path.join(process.cwd(), "python");

    const { stdout } = await execFileAsync(
      "python",
      [path.join(pythonDir, "vector_store.py"), "--status"],
      { cwd: process.cwd(), timeout: 10000 }
    );

    const status = JSON.parse(stdout);
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({
      totalVectors: 0,
      totalDocuments: 0,
      dim: 0,
      bitWidth: 4,
      indexSize: "0 B",
    });
  }
}
