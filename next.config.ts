import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
  // Produce a minimal standalone server for Docker runtime
  output: "standalone",
};

export default nextConfig;
