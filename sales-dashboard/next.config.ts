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
};

export default nextConfig;
