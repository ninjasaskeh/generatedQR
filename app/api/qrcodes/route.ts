import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { qrcode } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { ensureAdminApi } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const guard = await ensureAdminApi(req);
  if (guard instanceof NextResponse) return guard;
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit") || "0");
    let limit = Number.isFinite(limitParam) ? Math.floor(limitParam) : 0;
    if (limit <= 0) limit = 50;
    if (limit > 500) limit = 500;

    const pageParam = Number(searchParams.get("page") || "1");
    const page = Number.isFinite(pageParam)
      ? Math.max(1, Math.floor(pageParam))
      : 1;
    const offset = (page - 1) * limit;

    const [{ value: total }] = await db.select({ value: count() }).from(qrcode);

    const base = db.select().from(qrcode).orderBy(desc(qrcode.createdAt));

    const rows = await base.limit(limit).offset(offset);
    const pageCount = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ data: rows, page, limit, total, pageCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list QR codes" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await ensureAdminApi(req);
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json().catch(() => ({}));
    const countRaw = Number(body?.count ?? body?.jumlah ?? body?.qty ?? 0);

    let countVal = Number.isFinite(countRaw) ? Math.floor(countRaw) : 0;
    if (countVal <= 0) {
      return NextResponse.json({ error: "count harus > 0" }, { status: 400 });
    }
    if (countVal > 5000) {
      countVal = 5000;
    }

    const values = Array.from({ length: countVal }, () => ({}));

    const rows = await db
      .insert(qrcode)
      .values(values as never)
      .returning();

    revalidateTag("qrcodes");

    return NextResponse.json({ data: rows }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gagal membuat QR codes" },
      { status: 500 },
    );
  }
}
