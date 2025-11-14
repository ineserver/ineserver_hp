import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Noto_Sans_JP } from "next/font/google";

  const noto = Noto_Sans_JP({
    subsets: ["latin"],
    weight: ["400","500","700"],
    display: "swap",
  });

export const metadata: Metadata = {
  title: "いねさば",
  description: "Minecraftサーバー「いねさば」の公式ホームページです。",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="noto">
        {children}
      </body>
    </html>
  );
}
