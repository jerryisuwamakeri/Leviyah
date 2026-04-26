import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Skip Next.js image optimization — serve backend images directly.
    // Optimization can be re-enabled when deploying behind a CDN.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
