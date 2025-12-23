import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = "https://www.1necat.net";
const siteName = "いねさば";
const siteDescription = "あなたらしい距離感で街に溶け込める。そんな「都市計画サーバー」です。Minecraftサーバー「いねさば」の公式ホームページ。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Minecraft",
    "マインクラフト",
    "マイクラ",
    "サーバー",
    "マルチプレイ",
    "いねさば",
    "ineserver",
    "Java版",
    "サバイバル",
  ],
  authors: [{ name: "いね" }],
  creator: "いねさば",
  publisher: "いねさば",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/server-icon.png`,
        width: 256,
        height: 256,
        alt: `${siteName} ロゴ`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/server-icon.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";

// Google Analytics 測定ID（環境変数から取得）
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}

        {/* 構造化データ: WebSite */}
        <StructuredData
          type="WebSite"
          data={{
            name: "いねさば",
            url: "https://www.1necat.net",
            description: "あなたらしい距離感で街に溶け込める。そんな「都市計画サーバー」です。Minecraftサーバー「いねさば」の公式ホームページ。",
          }}
        />

        {/* 構造化データ: Organization */}
        <StructuredData
          type="Organization"
          data={{
            name: "いねさば",
            url: "https://www.1necat.net",
            logo: "https://www.1necat.net/server-icon.png",
            description: "あなたらしい距離感で街に溶け込める。そんな「都市計画サーバー」です。Minecraftサーバー「いねさば」の公式ホームページ。",
            sameAs: [],
          }}
        />
      </head>
      <body className="noto flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
