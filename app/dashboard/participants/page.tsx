import { db } from "@/db/drizzle";
import { qrcode } from "@/db/schema";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { QRCodesTable } from "@/components/qrcodes-table";
import { Badge } from "@/components/ui/badge";
import { count, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getCounts = unstable_cache(
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
  ["qrcodes-counts"],
  { revalidate: 10, tags: ["qrcodes"] },
);

const QRCodesPage = async () => {
  const { total, hadirCount, souvenirCount } = await getCounts();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">QR Codes</h1>
          <p className="text-sm text-muted-foreground">
            Generate dan kelola QR untuk absensi dan pengambilan souvenir.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">Total: {total}</Badge>
            <Badge variant="default">Hadir: {hadirCount}</Badge>
            <Badge variant="secondary">Souvenir: {souvenirCount}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/participants/add"
            className={buttonVariants({ size: "sm" })}
          >
            Generate QR
          </Link>
          <Link
            href="/dashboard/scan/hadir"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Scan Hadir
          </Link>
          <Link
            href="/dashboard/scan/souvenir"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Scan Souvenir
          </Link>
        </div>
      </div>

      {total === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed p-12 text-center">
          <div className="space-y-2">
            <p className="text-base font-medium">Belum ada QR</p>
            <p className="text-sm text-muted-foreground">
              Generate QR untuk mulai mencetak dan melakukan pemindaian.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/participants/add"
                className={buttonVariants()}
              >
                Generate QR
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="p-3 sm:p-4">
            <QRCodesTable data={[]} />
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodesPage;
