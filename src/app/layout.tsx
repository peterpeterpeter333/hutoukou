import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE, absoluteUrl } from "@/lib/site";

const noto = Noto_Sans_JP({
  variable: "--font-noto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

const zen = Zen_Maru_Gothic({
  variable: "--font-zen",
  weight: ["500", "700"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}｜${SITE.tagline}`,
    template: `%s｜${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "不登校",
    "不登校 相談",
    "不登校 親",
    "学校 行きたくない",
    "通信制高校",
    "五月雨登校",
    "起立性調節障害",
    "フリースクール",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE.name,
    title: `${SITE.name}｜${SITE.tagline}`,
    description: SITE.description,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}｜${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${noto.variable} ${zen.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
