"use client";

import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScanHadirPage() {
  const [busy, setBusy] = useState(false);
  const [tokenValue, setTokenValue] = useState("");
  const [scannerKb, setScannerKb] = useState(false);
  const manualInputRef = useRef<HTMLInputElement | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recent, setRecent] = useState<
    {
      id: string;
      token: string;
      hadir: boolean;
      souvenir: boolean;
      updatedAt: string | null;
    }[]
  >([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const fetchRecent = async () => {
    try {
      setRecentLoading(true);
      const res = await fetch("/api/qrcodes/recent?type=hadir&limit=5", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) setRecent(data.data || []);
    } catch {
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleSubmit = async () => {
    const token = tokenValue.trim();
    if (!token) return toast.error("Masukkan token QR");
    setBusy(true);
    try {
      const res = await fetch("/api/qrcodes/hadir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          toast.info("Sudah check-in (diabaikan)");
        } else {
          throw new Error(data?.error || "Gagal");
        }
      } else {
        toast.success("Check-in berhasil");
      }
      setTokenValue("");
      manualInputRef.current?.focus();
      await fetchRecent();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Token tidak valid";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Scan Hadir</h1>
          <p className="text-sm text-muted-foreground">
            Mode input saja (dukungan pemindai keyboard).
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/participants"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to list
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) handleSubmit();
          }}
          className="rounded-lg border bg-card p-3 sm:p-4 grid gap-3 content-start self-start"
        >
          <div className="grid gap-2">
            <Label htmlFor="token">Token QR</Label>
            <Input
              id="token"
              name="token"
              placeholder="Tempel token QR di sini"
              autoFocus
              ref={manualInputRef}
              value={tokenValue}
              onChange={(e) => {
                setTokenValue(e.target.value);
                if (scannerKb) {
                  if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
                  idleTimerRef.current = setTimeout(() => {
                    if (!busy && manualInputRef.current) {
                      manualInputRef.current.form?.requestSubmit();
                    }
                  }, 120);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!busy) manualInputRef.current?.form?.requestSubmit();
                }
              }}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                id="scannerKb"
                checked={scannerKb}
                onCheckedChange={(v) => setScannerKb(Boolean(v))}
              />
              <Label htmlFor="scannerKb" className="cursor-pointer">
                Mode Scanner Keyboard: Auto-submit
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => manualInputRef.current?.focus()}
              >
                Fokuskan Input
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Memproses..." : "Check-in"}
            </Button>
          </div>
        </form>

        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="text-sm font-medium mb-2">5 Data Terbaru (Hadir)</div>
          <div className="text-xs text-muted-foreground mb-3">
            Terbaru berdasarkan waktu pemindaian.
          </div>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">No</th>
                  <th className="text-left p-2">Token</th>
                  <th className="text-left p-2">Souvenir</th>
                </tr>
              </thead>
              <tbody>
                {recentLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`s-${i}`} className="border-t">
                      <td className="p-2">
                        <Skeleton className="h-4 w-6" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-64" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-6 w-24" />
                      </td>
                    </tr>
                  ))
                ) : recent.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-3 text-center text-muted-foreground"
                    >
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  recent.map((r, idx) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{idx + 1}</td>
                      <td
                        className="p-2 truncate max-w-[260px]"
                        title={r.token}
                      >
                        {r.token}
                      </td>
                      <td className="p-2">
                        <Badge
                          variant="outline"
                          className="text-muted-foreground px-1.5"
                        >
                          {r.souvenir ? (
                            <IconCircleCheckFilled className="mr-1 size-4 fill-green-500 dark:fill-green-400" />
                          ) : (
                            <IconLoader className="mr-1 size-4" />
                          )}
                          {r.souvenir ? "Diambil" : "Belum"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
