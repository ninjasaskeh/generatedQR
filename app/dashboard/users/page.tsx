"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { UsersTable } from "@/components/users/users-table";
import { ArrowLeft } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola user yang memiliki akses ke dashboard
          </p>
        </div>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-3 sm:p-4">
          <iframe
            width="110"
            height="200"
            src="https://www.myinstants.com/instant/wrong-lie-incorrect-buzzer-4726/embed/"
            frameBorder="0"
            scrolling="no"
          ></iframe>
          <UsersTable />
        </div>
      </div>
    </div>
  );
}
