import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { qrcode } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { ensureAdminApi } from "@/lib/require-admin";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: "POST, OPTIONS" },
  });
}

export async function POST(req: NextRequest) {
  const guard = await ensureAdminApi(req);
  if (guard instanceof NextResponse) return guard;
  try {
    const json = (await req.json().catch(() => ({}))) as Partial<{
      token: string;
      qrToken: string;
    }>;
    const token: string | undefined =
      typeof json.token === "string"
        ? json.token
        : typeof json.qrToken === "string"
          ? json.qrToken
          : undefined;
    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }
    const [existing] = await db
      .select()
      .from(qrcode)
      .where(eq(qrcode.token, token))
      .limit(1);
    if (!existing) {
      return NextResponse.json({ error: "QR not found" }, { status: 404 });
    }
    if (existing.hadir) {
      return NextResponse.json(
        { error: "Already checked in", data: existing },
        { status: 409 },
      );
    }
    const [updated] = await db
      .update(qrcode)
      .set({ hadir: true, updatedAt: new Date() })
      .where(eq(qrcode.token, token))
      .returning();

    revalidateTag("qrcodes");

    return NextResponse.json({ data: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to mark hadir" },
      { status: 500 },
    );
  }
}
