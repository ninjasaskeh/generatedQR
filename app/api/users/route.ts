import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user as userTable } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { ensureAdminApi } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const guard = await ensureAdminApi(req);
  if (guard instanceof NextResponse) return guard;
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit") || "10");
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(100, Math.floor(limitParam)))
      : 10;

    const pageParam = Number(searchParams.get("page") || "1");
    const page = Number.isFinite(pageParam)
      ? Math.max(1, Math.floor(pageParam))
      : 1;
    const offset = (page - 1) * limit;

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(userTable);
    const rows = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .orderBy(desc(userTable.createdAt))
      .limit(limit)
      .offset(offset);
    const pageCount = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ data: rows, page, limit, total, pageCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await ensureAdminApi(req);
  if (guard instanceof NextResponse) return guard;
  try {
    const json = (await req.json().catch(() => ({}))) as Partial<{
      email: string;
      password: string;
      name: string;
    }>;
    const email = typeof json.email === "string" ? json.email : undefined;
    const password =
      typeof json.password === "string" ? json.password : undefined;
    const name = typeof json.name === "string" ? json.name : undefined;
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "email, password, name required" },
        { status: 400 },
      );
    }

    await auth.api.signUpEmail({ body: { email, password, name } });

    // Set default role to admin for server-created users
    try {
      const listed = await auth.api.listUsers({
        query: {
          limit: 1,
          offset: 0,
          filterField: "email",
          filterOperator: "eq",
          filterValue: email,
        },
        headers: req.headers,
      });
      let userId: string | undefined;
      if (
        listed &&
        typeof listed === "object" &&
        "users" in listed &&
        Array.isArray((listed as { users: unknown }).users)
      ) {
        const usersArr = (listed as { users: Array<{ id?: unknown }> }).users;
        const first = usersArr[0];
        if (first && typeof first.id === "string") userId = first.id;
      }
      if (userId) {
        await auth.api.setRole({
          body: { userId, role: "admin" },
          headers: req.headers,
        });
      }
    } catch (e) {
      console.error("Failed to set role admin:", e);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create user";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
