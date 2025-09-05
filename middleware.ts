import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Optimistic redirect untuk pengguna belum login.
  if (!sessionCookie) {
    // Untuk API, kembalikan JSON 401 agar tidak mengirim HTML pada response API
    if (
      request.nextUrl.pathname.startsWith("/api/participants") ||
      request.nextUrl.pathname.startsWith("/api/qrcodes") ||
      request.nextUrl.pathname.startsWith("/api/users") ||
      request.nextUrl.pathname.startsWith("/api/me")
    ) {
      return NextResponse.json({ error: "Tidak berwenang" }, { status: 401 });
    }
    // Untuk halaman dashboard, arahkan ke /login
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/participants/:path*",
    "/api/qrcodes/:path*",
    "/api/users/:path*",
    "/api/me",
  ],
};
