import React from "react";
import { SectionCards } from "@/components/section-cards";
import { db } from "@/db/drizzle";
import { qrcode } from "@/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { QRCodesTable, type QRRow } from "@/components/qrcodes-table";
import { unstable_cache } from "next/cache";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

const getStats = unstable_cache(
  async () => {
    const [{ value: total }] = await db.select({ value: count() }).from(qrcode);
    const [{ value: hadirCount }] = await db
      .select({ value: count() })
      .from(qrcode)
      .where(eq(qrcode.hadir, true));
    const [{ value: souvenirCount }] = await db
      .select({ value: count() })
      .from(qrcode)
      .where(eq(qrcode.souvenir, true));
    return { total, hadirCount, souvenirCount } as const;
  },
  ["qrcodes-stats"],
  { revalidate: 10, tags: ["qrcodes"] },
);

const getLatest = unstable_cache(
  async () => {
    const latestRows = await db
      .select({
        id: qrcode.id,
        token: qrcode.token,
        hadir: qrcode.hadir,
        souvenir: qrcode.souvenir,
        createdAt: qrcode.createdAt,
      })
      .from(qrcode)
      .orderBy(desc(qrcode.createdAt))
      .limit(10);
    return latestRows as typeof latestRows;
  },
  ["qrcodes-latest"],
  { revalidate: 10, tags: ["qrcodes"] },
);

const DashboardIndexPage = async () => {
  const { total, hadirCount, souvenirCount } = await getStats();
  const belum = total - hadirCount;
  const rate = total > 0 ? (hadirCount / total) * 100 : 0;

  const latestRows = await getLatest();

  const latest: QRRow[] = latestRows.map((p) => ({
    id: p.id,
    token: p.token,
    hadir: p.hadir,
    souvenir: p.souvenir,
  }));

  return (
    <>
      {(() => {
        const Cards = SectionCards as unknown as React.FC<{
          total: number;
          hadir: number;
          belum: number;
          rate: number;
          souvenir: number;
        }>;
        return (
          <Cards
            total={total}
            hadir={hadirCount}
            belum={belum}
            rate={rate}
            souvenir={souvenirCount}
          />
        );
      })()}
      <div className="px-4 lg:px-6">
        <h2 className="mb-3 text-base font-semibold">QR Terbaru</h2>
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <QRCodesTable data={latest} />
        </div>
      </div>
    </>
  );
};
export default DashboardIndexPage;
