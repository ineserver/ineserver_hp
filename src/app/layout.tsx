import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "いねさば",
  description: "Minecraftサーバー「いねさば」の公式ホームページです。",
  openGraph: {
    title: "いねさば",
    description: "Minecraftサーバー「いねさば」の公式ホームページです。",
    type: "website",
    url: "https://ineserver.net",
    siteName: "いねさば",
  },
  twitter: {
    card: "summary",
    title: "いねさば",
    description: "Minecraftサーバー「いねさば」の公式ホームページです。",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

import Footer from "@/components/Footer";

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
