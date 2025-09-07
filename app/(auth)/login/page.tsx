import { LoginForm } from "@/components/login-form";
import type { Metadata } from "next";
import { QrCode } from "lucide-react";
import * as React from "react";

export const metadata: Metadata = {
  title: "Masuk | Absensi QR Code",
  description: "Masuk untuk mengelola peserta dan absensi QR.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

const LoginPage = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex size-7 items-center justify-center rounded-sm border border-secondary-foreground/30">
            <QrCode className="!size-5" />
          </div>
          <span className="text-base font-semibold">QR Attendance</span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
