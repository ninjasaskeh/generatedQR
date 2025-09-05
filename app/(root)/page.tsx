import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { IconCamera, IconQrcode, IconChevronRight } from "@tabler/icons-react";
import SignUp from "@/components/signUp";

const Home = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-svh">
      {/* Hero */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pb-14 pt-16 text-center sm:gap-8 sm:pb-20 sm:pt-20">
        <Badge variant="outline" className="mb-2">
          Solusi Absensi Gathering
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Kelola Absensi dengan QR Code, cepat dan akurat
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
          Generate QR massal sesuai kebutuhan, cetak dengan template siap pakai,
          dan tandai kehadiran serta pengambilan souvenir dengan pemindaian
          kamera.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "lg", className: "gap-2" })}
              >
                Buka Dashboard
                <IconChevronRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/participants/add"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Generate QR
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ size: "lg", className: "gap-2" })}
              >
                Masuk <IconChevronRight className="size-4" />
              </Link>
            </>
          )}
          <SignUp />
        </div>
      </section>

      {/* Fitur */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <IconQrcode className="size-5" />
                Generate QR Massal
              </CardTitle>
              <CardDescription>
                Masukkan jumlah QR, sistem membuat token otomatis dan siap
                dicetak.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Unduh PNG (ZIP) yang sudah ditempel pada template.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <IconQrcode className="size-5" />
                Pindai QR & Tandai Hadir/Souvenir
              </CardTitle>
              <CardDescription>
                Pemindaian via kamera perangkat atau input token manual.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Dua mode: Scan Hadir dan Scan Souvenir.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <IconCamera className="size-5" />
                Data & Statistik QR
              </CardTitle>
              <CardDescription>
                Tabel QR dengan status hadir/souvenir dan ringkasan di
                dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Pantau total QR, yang hadir, dan progres secara berkala.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA akhir */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-xl border bg-card p-6 text-center sm:p-10">
          <h2 className="text-xl font-semibold sm:text-2xl">
            Siap memulai absensi yang lebih cepat?
          </h2>
          <p className="text-muted-foreground mt-2">
            Masuk sekarang dan kelola QR absensi Anda.
          </p>
        </div>
      </section>
    </div>
  );
};
export default Home;
