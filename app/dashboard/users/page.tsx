"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Datatable dengan aksi minimalis (ikon), tambah/edit via dialog.
          </p>
        </div>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-3 sm:p-4">
          <UsersTable />
        </div>
      </div>
    </div>
  );
}
