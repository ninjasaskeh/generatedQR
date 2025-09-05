"use client";

import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

export default function PrintAllPostersPage() {
  const [tokens, setTokens] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("Menyiapkan...");
  const once = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem("printTokens");
    if (!raw) return;
    try {
      const arr = JSON.parse(raw) as string[];
      setTokens(Array.isArray(arr) ? arr : []);
    } catch {
      setTokens([]);
    }
  }, []);

  useEffect(() => {
    if (!tokens.length) return;
    if (once.current) return;
    once.current = true;
    (async () => {
      try {
        setStatus("Memuat template...");
        const bg = await loadImage("/BRCODE%20DEPAN.jpg");
        const makePoster = async (token: string) => {
          const canvas = document.createElement("canvas");
          canvas.width = bg.naturalWidth;
          canvas.height = bg.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return "";
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
          const qr = await loadImage(
            `/api/qr?size=500x500&data=${encodeURIComponent(token)}`,
          );
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(qr, 292, 860, 500, 500);
          return canvas.toDataURL("image/png");
        };

        setStatus("Menyusun poster...");
        const posters: string[] = [];
        let i = 0;
        for (const t of tokens) {
          i++;
          const u = await makePoster(t);
          if (u) posters.push(u);
          if (i % 25 === 0)
            await new Promise((r) => requestAnimationFrame(() => r(undefined)));
        }

        setStatus("Membuat PDF...");
        const doc = new jsPDF({
          unit: "pt",
          format: "a4",
          orientation: "portrait",
        });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 24; // 24pt margin
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
        });
        const filename = `QR_${tokens.length}_Posters.pdf`;
        doc.save(filename);
        setStatus(`Selesai. Mengunduh ${filename}`);
      } catch (e) {
        console.error(e);
        setStatus("Gagal membuat PDF");
      }
    })();
  }, [tokens]);

  return (
    <div className="p-4">
      {!tokens.length ? (
        <div className="text-sm text-muted-foreground">
          Tidak ada data untuk dicetak. Kembali ke halaman Generate dan pilih
          Print to PDF.
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">{status}</div>
      )}
    </div>
  );
}
