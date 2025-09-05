import { NextResponse } from "next/server";

// Deprecate old participants checkin endpoint to avoid conflicts after switching to qrcode-based scanning.
export async function POST() {
  return NextResponse.json(
    { error: "Participants check-in removed" },
    { status: 410 },
  );
}
