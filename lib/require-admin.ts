import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const adminUserIds = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const adminRoles = (process.env.ADMIN_ROLES || "admin")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const isAdminSession = (
  session?: {
    user?: { id?: string; role?: string | null } | null;
  } | null,
) => {
  const id = session?.user?.id;
  const roleField = session?.user?.role || "";
  const roles = roleField
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const hasAdminRole = roles.some((r) => adminRoles.includes(r));
  const isAdminId = !!id && adminUserIds.includes(id);
  return hasAdminRole || isAdminId;
};

// For server components/pages: redirects when not allowed
export const requireAdminPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!isAdminSession(session)) redirect("/not-admin");
  return session;
};

// Back-compat alias
export const requireAdmin = requireAdminPage;

// For route handlers: returns NextResponse on 401/403, otherwise the session
export const ensureAdminApi = async (
  req: NextRequest,
): Promise<
  | { session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>> }
  | NextResponse
> => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isAdminSession(session))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    type SessionT = NonNullable<
      Awaited<ReturnType<typeof auth.api.getSession>>
    >;
    return { session: session as SessionT };
  } catch (e) {
    // If Better Auth fails due to DB/network issues, surface 503 to clients
    const msg = e instanceof Error ? e.message : "Service unavailable";
    return NextResponse.json(
      { error: `Auth unavailable: ${msg}` },
      { status: 503 },
    );
  }
};
