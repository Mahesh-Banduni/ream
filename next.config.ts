import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    // Remotion's bundler + renderer are Node.js-only and must not be bundled by Next.js webpack
    "@remotion/bundler",
    "@remotion/renderer",
    "esbuild",
    "esbuild-register",
  ],
};

export default nextConfig;
