import { db } from "@/db/drizzle";
import { user as userTable } from "@/db/schema";
import { ensureAdminApi } from "@/lib/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type { RouteParamsIdPromise, UserUpdateBody } from "@/types";

export async function PUT(
  req: NextRequest,
  ctx: { params: RouteParamsIdPromise },
) {
  const guard = await ensureAdminApi(req);
  if (guard instanceof NextResponse) return guard;
  try {
    const { id } = await ctx.params;
    const json = (await req.json().catch(() => ({}))) as UserUpdateBody;
    const name: string | undefined =
      typeof json.name === "string" ? json.name : undefined;
    const email: string | undefined =
      typeof json.email === "string" ? json.email : undefined;
    const image: string | undefined =
      typeof json.image === "string" ? json.image : undefined;

    if (!name && !email && !image) {
      return NextResponse.json(
        { error: "no fields to update" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(userTable)
      .set({
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(image ? { image } : {}),
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, id))
      .returning();

    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to update user";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: RouteParamsIdPromise },
) {
  const guard = await ensureAdminApi(req);
  if (guard instanceof NextResponse) return guard;
  try {
    const { id } = await ctx.params;
    // Prevent admin from deleting their own account
    const currentUserId = guard.session?.user?.id;
    if (currentUserId && id === currentUserId) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus akun sendiri" },
        { status: 400 },
      );
    }

    const [deleted] = await db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();
    if (!deleted)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to delete user";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
