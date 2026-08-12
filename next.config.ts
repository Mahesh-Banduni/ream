import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    // Remotion's bundler + renderer are Node.js-only and must not be bundled by Next.js webpack
    "@remotion/bundler",
    "@remotion/renderer",
    "esbuild",
    "esbuild-register",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // 31 days — keep optimized variants warm so cold-cache LCP hits are rare
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  allowedDevOrigins: ['tiara-reconcile-clapped.ngrok-free.dev'],
};

export default nextConfig;
