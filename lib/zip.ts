// ZIP file builder using @zip.js/zip.js
// Files: Array<{ name: string; data: Uint8Array; }>
// Returns: Blob of application/zip

import * as zip from "@zip.js/zip.js";

// Ensure zip.js doesn't try to load worker assets (simpler bundling in Next.js)
zip.configure({ useWebWorkers: false });

export async function zipFiles(
  files: { name: string; data: Uint8Array }[],
): Promise<Blob> {
  // Use store (level 0) because PNGs are already compressed
  const writer = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
  for (const f of files) {
    await writer.add(f.name, new zip.Uint8ArrayReader(f.data), { level: 0 });
  }
  const blob = await writer.close();
  return blob;
}

export async function zipFilesWithProgress(
  files: { name: string; data: Uint8Array }[],
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const total = files.length;
  if (onProgress) onProgress(0, total);
  const writer = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
  let done = 0;
  for (const f of files) {
    await writer.add(f.name, new zip.Uint8ArrayReader(f.data), { level: 0 });
    done++;
    if (onProgress) onProgress(done, total);
    // Yield to UI occasionally
    if (done % 20 === 0)
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
  }
  const blob = await writer.close();
  if (onProgress) onProgress(total, total);
  return blob;
}
