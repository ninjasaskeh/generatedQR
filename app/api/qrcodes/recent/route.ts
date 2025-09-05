import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { qrcode } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureAdminApi } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const guard = await ensureAdminApi(req);
  if (guard instanceof NextResponse) return guard;
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "hadir").toLowerCase();
    const limitParam = Number(searchParams.get("limit") || "5");
    const limit = Number.isFinite(limitParam)
      ? Math.min(50, Math.max(1, Math.floor(limitParam)))
      : 5;

    if (type === "souvenir") {
      const rows = await db
        .select({
          id: qrcode.id,
          token: qrcode.token,
          hadir: qrcode.hadir,
          souvenir: qrcode.souvenir,
          updatedAt: qrcode.updatedAt,
        })
        .from(qrcode)
        .where(eq(qrcode.souvenir, true))
        .orderBy(desc(qrcode.updatedAt))
        .limit(limit);
      return NextResponse.json({ data: rows });
    }

    const rows = await db
      .select({
        id: qrcode.id,
        token: qrcode.token,
        hadir: qrcode.hadir,
        souvenir: qrcode.souvenir,
        updatedAt: qrcode.updatedAt,
      })
      .from(qrcode)
      .where(eq(qrcode.hadir, true))
      .orderBy(desc(qrcode.updatedAt))
      .limit(limit);
    return NextResponse.json({ data: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch recent scans" },
      { status: 500 },
    );
  }
}
