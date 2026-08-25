import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { withBasePath } from "../domain/paths";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aibti.example.com";
const metadataOrigin = new URL(siteUrl).origin;

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: {
    default: "AIBTI 建筑人格测试",
    template: "%s · AIBTI",
  },
  description: "18 道题，找到与你同频的建筑人格、建筑师与代表建筑。",
  openGraph: {
    title: "AIBTI 建筑人格测试",
    description: "先被结果逗笑，再真正看懂一种建筑。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: withBasePath("/images/og/default.jpg"), width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2efe7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <header className="site-header">
          <Link className="brand-lockup" href="/" aria-label="返回 AIBTI 首页">
            <span className="brand-mark">AI</span>
            <span className="brand-word">BTI</span>
            <span className="brand-cn">建筑人格</span>
          </Link>
          <Link className="header-link" href="/about/">方法与图源</Link>
        </header>
        {children}
      </body>
    </html>
  );
}
