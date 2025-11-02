import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.gyazo.com',
      },
    ],
  },
};

export default nextConfig;
