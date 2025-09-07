"use client";

import { useRef, useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { QRCodesTable } from "@/components/qrcodes-table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ArrowLeft, ScanBarcode } from "lucide-react";

export default function ScanHadirPage() {
  const [busy, setBusy] = useState(false);
  const [tokenValue, setTokenValue] = useState("");
  const [scannerKb] = useState(true);
  const manualInputRef = useRef<HTMLInputElement | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [{ total, hadirCount, souvenirCount }, setCounts] = useState({
    total: 0,
    hadirCount: 0,
    souvenirCount: 0,
  });

  async function loadCounts() {
    try {
      const [allRes, hadirRes, souvenirRes] = await Promise.all([
        fetch(`/api/qrcodes?limit=1&page=1`, { cache: "no-store" }),
        fetch(`/api/qrcodes?type=hadir&limit=1&page=1`, { cache: "no-store" }),
        fetch(`/api/qrcodes?type=souvenir&limit=1&page=1`, {
          cache: "no-store",
        }),
      ]);
      const [allJson, hadirJson, souvenirJson] = await Promise.all([
        allRes.json(),
        hadirRes.json(),
        souvenirRes.json(),
      ]);
      setCounts({
        total: Number(allJson?.total || 0),
        hadirCount: Number(hadirJson?.total || 0),
        souvenirCount: Number(souvenirJson?.total || 0),
      });
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void loadCounts();
  }, []);

  // Focus hidden input on mount and when dialog closes to keep scanner ready
  useEffect(() => {
    if (!dialogOpen) {
      manualInputRef.current?.focus();
    }
  }, [dialogOpen]);

  const handleSubmit = async () => {
    const token = tokenValue.trim();
    if (!token) return toast.error("Masukkan token QR");
    if (submittingRef.current) return; // prevent double submit
    submittingRef.current = true;
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
          toast.info("Anda sudah check-in sebelumnya");
        } else {
          throw new Error(data?.error || "Gagal");
        }
      } else {
        toast.success("Check-in berhasil");
      }
      setTokenValue("");
      setDialogOpen(false);
      manualInputRef.current?.focus();
      setRefreshKey((k) => k + 1);
      void loadCounts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Token tidak valid";
      toast.error(msg);
    } finally {
      setBusy(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Scan Kehadiran
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">Total: {total}</Badge>
            <Badge variant="default">Hadir: {hadirCount}</Badge>
            <Badge variant="secondary">Souvenir: {souvenirCount}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/participants"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </div>
      </div>

      {/* Hidden focused input for scanner devices */}
      <input
        ref={manualInputRef}
        value={tokenValue}
        onChange={(e) => {
          setTokenValue(e.target.value);
          if (scannerKb) {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
              if (!busy && !submittingRef.current && manualInputRef.current) {
                void handleSubmit();
              }
            }, 150);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (!busy && !submittingRef.current) void handleSubmit();
          }
        }}
        className="sr-only"
        aria-hidden
        autoFocus
      />

      <div className="rounded-lg border bg-card p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="">
            <div className="text-sm font-medium mb-2">Scan QR Kehadiran</div>
            <div className="text-xs text-muted-foreground mb-3">
              Data peserta yang telah melakukan scan QR <i>(Check-In)</i>
            </div>
          </div>
          <div className="items-center justify-center">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <ScanBarcode className="size-4" />
                  Input Manual
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Input Token Manual</DialogTitle>
                  <DialogDescription>
                    Masukkan token QR secara manual lalu submit untuk menandai
                    hadir.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="token-manual">Token QR</Label>
                  <Input
                    id="token-manual"
                    value={tokenValue}
                    onChange={(e) => setTokenValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!busy) void handleSubmit();
                      }
                    }}
                    placeholder="Tempel atau ketik token di sini"
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Batal
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={busy}
                  >
                    {busy ? "Memproses..." : "Submit"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <QRCodesTable
          data={[]}
          initialPageSize={5}
          refreshKey={refreshKey}
          showActions={false}
          filterType="hadir"
        />
      </div>
    </div>
  );
}
