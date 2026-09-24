import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    workerThreads: false,
  },
  images: {
    // img.1necat.net（Cloudflare R2）の画像は Cloudflare Images で変換して配信する
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.1necat.net',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'minotar.net',
      },
    ],
  },
};

export default nextConfig;
