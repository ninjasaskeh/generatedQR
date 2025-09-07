import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Masuk | Absensi QR Code",
  description: "Login untuk mengelola absensi QR Code.",
};

const AuthSegmentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <footer className="mt-10 border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <Image
            src="/logo-dolly.png"
            alt="Dolly Logo"
            width={100}
            height={100}
            className="h-5 w-auto"
            priority
          />
        </div>
      </footer>
    </>
  );
};

export default AuthSegmentLayout;
