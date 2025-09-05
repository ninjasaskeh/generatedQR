"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function useSearchParam(name: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    setValue(usp.get(name));
  }, [name]);
  return value;
}

export default function QRTemplateComposerPage() {
  const tokenParam = useSearchParam("token") ?? "";
  const autoParam = useSearchParam("auto") ?? "";
  const nameParam = useSearchParam("name") ?? "";
  const [token, setToken] = useState("");

  const [bgReady, setBgReady] = useState(false);
  const [bgSize, setBgSize] = useState<{ w: number; h: number } | null>(null);

  // Fixed QR placement defaults
  const [x, setX] = useState(292);
  const [y, setY] = useState(860);
  const [qrSize, setQrSize] = useState(500);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [printUrl, setPrintUrl] = useState<string | null>(null);
  const autoOnceRef = useRef(false);

  // Prefill token from query
  useEffect(() => {
    if (tokenParam && !token) setToken(tokenParam);
  }, [tokenParam, token]);

  // Load background to know its intrinsic size for pixel-perfect output
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setBgSize({ w: img.naturalWidth, h: img.naturalHeight });
      setBgReady(true);
    };
    img.onerror = () => setBgReady(false);
    img.src = "/BRCODE%20DEPAN.jpg";
  }, []);

  const bgAspect = useMemo(() => {
    if (!bgSize) return 1;
    return bgSize.w / bgSize.h;
  }, [bgSize]);

  const onSnapToPlaceholder = () => {
    // Snap to provided exact coordinates and size
    setX(292);
    setY(860);
    setQrSize(500);
  };

  const draw = useCallback(async () => {
    if (!canvasRef.current || !bgSize || !token) return;
    const canvas = canvasRef.current;
    canvas.width = bgSize.w;
    canvas.height = bgSize.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load background
    const bg = await loadImage("/BRCODE%20DEPAN.jpg");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Load QR via same-origin proxy to avoid tainting the canvas
    const qrPx = Math.max(50, Math.min(qrSize, Math.min(bgSize.w, bgSize.h)));
    const qrUrl = `/api/qr?size=${qrPx}x${qrPx}&data=${encodeURIComponent(
      token,
    )}`;
    const qr = await loadImage(qrUrl);
    ctx.imageSmoothingEnabled = false; // keep QR crisp
    ctx.drawImage(qr, x, y, qrPx, qrPx);
  }, [bgSize, qrSize, token, x, y]);

  const onDownload = useCallback(async () => {
    await draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const base = nameParam
      ? `${sanitize(nameParam)} Absensi QR Code`
      : "Absensi QR Code";
    a.download = `${base}.png`;
    a.click();
  }, [draw, nameParam]);

  const onPrint = async () => {
    await draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    setPrintUrl(url);
    // Give the overlay a tick to render then print
    setTimeout(() => {
      window.print();
    }, 50);
  };

  // Clear print overlay after printing
  useEffect(() => {
    const handler = () => setPrintUrl(null);
    window.addEventListener("afterprint", handler);
    return () => window.removeEventListener("afterprint", handler);
  }, []);

  // Auto-download when requested via ?auto=download
  useEffect(() => {
    if (!bgReady || !token) return;
    if (autoParam?.toLowerCase() === "download" && !autoOnceRef.current) {
      autoOnceRef.current = true;
      onSnapToPlaceholder();
      // Slight delay to ensure state applied
      setTimeout(() => {
        onDownload();
      }, 0);
    }
  }, [autoParam, bgReady, token, onDownload]);

  return (
    <div className="space-y-5">
      {/* Print overlay that uses Next.js <Image> instead of <img> */}
      {printUrl && bgSize ? (
        <div className="fixed inset-0 z-50 bg-white p-0 m-0">
          <div className="relative w-full h-full">
            <Image
              src={printUrl}
              alt="QR Poster"
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Template QR</h1>
          <p className="text-sm text-muted-foreground">
            Sesuaikan jika perlu lalu unduh/cetak.
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

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="rounded-lg border bg-card p-3 sm:p-4 grid gap-3 content-start self-start">
          <div className="grid gap-2">
            <Label htmlFor="token">Token QR</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Tempel token QR peserta"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="x">Posisi X</Label>
              <Input
                id="x"
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="y">Posisi Y</Label>
              <Input
                id="y"
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="size">Ukuran QR</Label>
              <Input
                id="size"
                type="number"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSnapToPlaceholder}
              disabled={!bgReady}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={onDownload}
              disabled={!token || !bgReady}
            >
              Unduh PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onPrint}
              disabled={!token || !bgReady}
            >
              Cetak
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Gunakan Reset untuk menerapkan X:292, Y:860, Size:500 (sesuai
            template).
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 sm:p-4 grid gap-3 content-start">
          <div className="text-sm text-muted-foreground">Pratinjau</div>
          <div
            ref={previewRef}
            className="relative w-full overflow-hidden rounded-md border bg-white"
          >
            {/* Maintain aspect ratio of background using padding hack */}
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: `${100 / bgAspect}%`,
              }}
            >
              {/* Background preview */}
              <Image
                src="/BRCODE%20DEPAN.jpg"
                alt="Template"
                fill
                sizes="100vw"
                className="object-contain"
                onLoad={() => setBgReady(true)}
              />
              {/* QR overlay approximation (not actual drawing) */}
              {token && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {/* Translate pixel placement to percentage based on intrinsic size */}
                  {bgSize && (
                    <div
                      className="ring-2 ring-primary/70 bg-white"
                      style={{
                        position: "absolute",
                        left: `${(x / bgSize.w) * 100}%`,
                        top: `${(y / bgSize.h) * 100}%`,
                        width: `${(qrSize / bgSize.w) * 100}%`,
                        height: `${(qrSize / bgSize.h) * 100}%`,
                      }}
                      title="Perkiraan posisi QR"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = (e: unknown) => reject(e);
    img.crossOrigin = "anonymous"; // ensure canvas not tainted when possible
    img.src = src;
  });
}

function sanitize(s: string) {
  return s
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
