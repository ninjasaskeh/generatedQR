import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ENABLE_SEED || process.env.ENABLE_SEED !== "1") {
      return NextResponse.json({ error: "Seed disabled" }, { status: 403 });
    }
    const body = (await req.json().catch(() => ({}))) as Partial<{
      email: string;
      password: string;
      name: string;
    }>;
    const email =
      body.email || process.env.SEED_ADMIN_EMAIL || "admin@admin.com";
    const password =
      body.password || process.env.SEED_ADMIN_PASSWORD || "12345678";
    const name = body.name || process.env.SEED_ADMIN_NAME || "Admin";

    await auth.api.signUpEmail({
      body: { email, password, name },
    });

    return NextResponse.json({ success: true, email });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
