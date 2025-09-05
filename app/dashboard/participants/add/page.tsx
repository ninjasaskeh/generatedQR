"use client";

import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import jsPDF from "jspdf";
import { zipFilesWithProgress } from "@/lib/zip";
import { Progress } from "@/components/ui/progress";

type CreatedQR = {
  id: string;
  token: string;
  hadir: boolean;
  souvenir: boolean;
};

const GenerateQRPage = () => {
  const [count, setCount] = useState<number>(100);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<CreatedQR[]>([]);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipPhase, setZipPhase] = useState<null | "compose" | "zip" | "pdf">(
    null,
  );

  const hasRows = rows.length > 0;

  const onGenerate = async () => {
    if (!Number.isFinite(count) || count <= 0) {
      return toast.error("Masukkan jumlah yang valid");
    }
    setBusy(true);
    setRows([]);
    try {
      const res = await fetch("/api/qrcodes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count: Math.min(5000, Math.floor(count)) }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data &&
          typeof data === "object" &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error?: string }).error
            : "Gagal membuat QR",
        );
      const arr = Array.isArray((data as { data?: unknown }).data)
        ? (
            data as {
              data: Array<{
                id?: unknown;
                token?: unknown;
                hadir?: unknown;
                souvenir?: unknown;
              }>;
            }
          ).data
        : [];
      const created: CreatedQR[] = arr.map((r) => ({
        id: String(r.id ?? ""),
        token: String(r.token ?? ""),
        hadir: Boolean(r.hadir),
        souvenir: Boolean(r.souvenir),
      }));
      setRows(created);
      toast.success(`${created.length} QR dibuat`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal membuat QR";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const composePoster = async (token: string): Promise<Blob> => {
    const bg = await loadImage("/BRCODE%20DEPAN.jpg");
    const canvas = document.createElement("canvas");
    canvas.width = bg.naturalWidth;
    canvas.height = bg.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak didukung");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    const qr = await loadImage(
      `/api/qr?size=500x500&data=${encodeURIComponent(token)}`,
    );
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qr, 292, 860, 500, 500);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Gagal membuat PNG"))),
        "image/png",
      ),
    );
    return blob;
  };

  const composePosterDataUrl = async (token: string): Promise<string> => {
    const bg = await loadImage("/BRCODE%20DEPAN.jpg");
    const canvas = document.createElement("canvas");
    canvas.width = bg.naturalWidth;
    canvas.height = bg.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak didukung");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    const qr = await loadImage(
      `/api/qr?size=500x500&data=${encodeURIComponent(token)}`,
    );
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qr, 292, 860, 500, 500);
    return canvas.toDataURL("image/png");
  };

  const onDownloadZip = async () => {
    if (!hasRows) return;
    setBusy(true);
    setZipProgress(0);
    setZipPhase("compose");
    try {
      const files: { name: string; data: Uint8Array }[] = [];
      let i = 0;
      const total = rows.length;
      for (const r of rows) {
        i++;
        const png = await composePoster(r.token);
        const buf = new Uint8Array(await png.arrayBuffer());
        files.push({ name: `QR_${String(i).padStart(4, "0")}.png`, data: buf });
        // Update progress during composition (first 70%)
        setZipProgress(Math.round((i / total) * 70));
      }
      setZipPhase("zip");
      // Make ZIP with progress for remaining 30%
      const blob = await zipFilesWithProgress(files, (done, totalFiles) => {
        const zipPortion = Math.round((done / totalFiles) * 30);
        setZipProgress(70 + zipPortion);
      });
      downloadBlob(blob, `QR_${rows.length}_PNG.zip`);
      setZipProgress(100);
    } catch (e) {
      console.error(e);
      toast.error("Gagal membuat ZIP");
    } finally {
      setBusy(false);
      // Small delay to let users see 100%
      setTimeout(() => {
        setZipPhase(null);
        setZipProgress(0);
      }, 500);
    }
  };

  const onPrintPdf = async () => {
    if (!hasRows) return;
    setBusy(true);
    setZipProgress(0);
    setZipPhase("compose");
    try {
      // compose posters as data URLs with progress (first 70%)
      const posters: string[] = [];
      let i = 0;
      const total = rows.length;
      for (const r of rows) {
        i++;
        const dataUrl = await composePosterDataUrl(r.token);
        posters.push(dataUrl);
        setZipProgress(Math.round((i / total) * 70));
        if (i % 20 === 0)
          await new Promise((r) => requestAnimationFrame(() => r(undefined)));
      }

      // Build PDF (remaining 30%)
      setZipPhase("pdf");
      const bg = await loadImage("/BRCODE%20DEPAN.jpg");
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
        orientation: "portrait",
      });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 24;
      const imgW = bg.naturalWidth;
      const imgH = bg.naturalHeight;
      const scale = Math.min(
        (pageW - margin * 2) / imgW,
        (pageH - margin * 2) / imgH,
      );
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const offsetX = (pageW - drawW) / 2;
      const offsetY = (pageH - drawH) / 2;

      posters.forEach((dataUrl, idx) => {
        if (idx > 0) doc.addPage();
        doc.addImage(
          dataUrl,
          "PNG",
          offsetX,
          offsetY,
          drawW,
          drawH,
          undefined,
          "FAST",
        );
        const done = 70 + Math.round(((idx + 1) / posters.length) * 30);
        setZipProgress(done);
      });
      const filename = `QR_${rows.length}_Posters.pdf`;
      doc.save(filename);
      setZipProgress(100);
    } catch (e) {
      console.error(e);
      toast.error("Gagal membuat PDF");
    } finally {
      setBusy(false);
      setTimeout(() => {
        setZipPhase(null);
        setZipProgress(0);
      }, 500);
    }
  };

  const firstToken = rows[0]?.token;
  const previewUrl = usePosterDataUrl(firstToken);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Generate QR</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan jumlah, sistem akan membuat token dan poster QR sesuai
            template.
          </p>
        </div>
        <Link
          href="/dashboard/participants"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to list
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-3 sm:p-4 grid gap-3 content-start self-start">
          <div className="grid gap-2">
            <Label htmlFor="count">Jumlah QR</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={5000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              placeholder="misal: 1000"
            />
          </div>
          {zipPhase ? (
            <div className="space-y-1 mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {zipPhase === "compose"
                    ? "Menyiapkan gambar"
                    : zipPhase === "zip"
                      ? "Membuat ZIP"
                      : "Membuat PDF"}
                </span>
                <span>{zipProgress}%</span>
              </div>
              <Progress value={zipProgress} />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={onGenerate} disabled={busy}>
              {busy ? "Memproses..." : "Generate"}
            </Button>
            <Button
              onClick={onDownloadZip}
              variant="outline"
              disabled={!hasRows || busy}
            >
              Unduh PNG (ZIP)
            </Button>
            <Button
              onClick={onPrintPdf}
              variant="outline"
              disabled={!hasRows || busy}
            >
              Print to PDF
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Catatan: Pembuatan ZIP untuk jumlah besar dapat memakan waktu.
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 sm:p-4 grid gap-3 content-start">
          {!hasRows ? (
            <div className="text-sm text-muted-foreground">
              Poster pratinjau akan tampil di sini setelah generate.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Dibuat:{" "}
                <span className="font-medium text-foreground">
                  {rows.length}
                </span>{" "}
                QR
              </div>
              {previewUrl ? (
                <div className="rounded-md overflow-hidden border w-full bg-white p-2">
                  <Image
                    src={previewUrl}
                    alt="QR Poster"
                    width={400}
                    height={400}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : null}
              <div className="text-xs break-all">
                Token pertama: {firstToken}
              </div>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Catatan: Pembuatan ZIP untuk jumlah besar dapat memakan waktu.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateQRPage;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = (e: unknown) => reject(e);
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  a.download = filename;
  document.body.appendChild(a);
  // Safari fallback: if download attr unsupported, open in new tab
  if (typeof a.download === "undefined") {
    window.open(url, "_blank");
  } else {
    a.click();
  }
  a.remove();
  // Delay revoke to avoid Safari/macOS truncation
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function usePosterDataUrl(token?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let canceled = false;
    (async () => {
      if (!token) return setUrl(null);
      try {
        const bg = await loadImage("/BRCODE%20DEPAN.jpg");
        if (canceled) return;
        const canvas = document.createElement("canvas");
        canvas.width = bg.naturalWidth;
        canvas.height = bg.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return setUrl(null);
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        const qr = await loadImage(
          `/api/qr?size=500x500&data=${encodeURIComponent(token)}`,
        );
        if (canceled) return;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(qr, 292, 860, 500, 500);
        if (!canceled) setUrl(canvas.toDataURL("image/png"));
      } catch {
        if (!canceled) setUrl(null);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [token]);
  return url;
}
