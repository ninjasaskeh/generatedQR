import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Absensi QR Code | Kelola Absensi Peserta dengan QR",
  description:
    "Kelola absensi gathering dengan QR Code: tambah peserta, generate QR, dan tandai hadir via pemindaian kamera.",
};

const RootSegmentLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default RootSegmentLayout;
