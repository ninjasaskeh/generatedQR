import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Participants API removed" },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Participants API removed" },
    { status: 410 },
  );
}
