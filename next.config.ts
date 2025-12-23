import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.1necat.net',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
    ],
  },
};

export default nextConfig;
