import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // For Netlify deployment with API routes
  experimental: {
    esmExternals: true,
  },
  // Disable ESLint during build for production
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
