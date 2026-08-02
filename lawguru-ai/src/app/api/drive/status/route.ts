import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const configured = !!clientId;

  // Check if we have stored tokens (from OAuth callback)
  const cookieStore = await cookies();
  const tokens = cookieStore.get("gdrive_tokens");
  const connected = !!tokens?.value;

  return NextResponse.json({ configured, connected });
}
