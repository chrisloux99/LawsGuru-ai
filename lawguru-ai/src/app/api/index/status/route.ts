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
