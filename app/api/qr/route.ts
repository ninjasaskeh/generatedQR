import { NextRequest, NextResponse } from "next/server";

// Simple proxy to fetch QR images from api.qrserver.com so we can draw them onto canvas without CORS issues
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");
  const size = searchParams.get("size") || "1000x1000";
  if (!data) {
    return new NextResponse("Missing data", { status: 400 });
  }
  const upstream = `https://api.qrserver.com/v1/create-qr-code/?size=${encodeURIComponent(size)}&data=${encodeURIComponent(
    data,
  )}`;
  try {
    const res = await fetch(upstream);
    if (!res.ok) {
      return new NextResponse("Upstream error", { status: 502 });
    }
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": res.headers.get("content-type") || "image/png",
        // Allow caching on the edge/browser for a bit to reduce requests
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("Failed", { status: 500 });
  }
}
