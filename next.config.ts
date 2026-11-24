import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    workerThreads: false,
  },
  // 道路・鉄道のガイドラインを「交通の登録」1ページにまとめたため、古いURLを転送する
  async redirects() {
    return [
      { source: '/transport/road', destination: '/transport/registration', permanent: true },
      { source: '/transport/rail', destination: '/transport/registration', permanent: true },
    ];
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
