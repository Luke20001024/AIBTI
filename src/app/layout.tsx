import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/900.css";
import { SiteHeader } from "../components/site-header";
import { withBasePath } from "../domain/paths";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arcbti.example.com";
const metadataOrigin = new URL(siteUrl).origin;

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: {
    default: "ArcBTI 建筑直觉测试",
    template: "%s · ArcBTI",
  },
  description: "18 道直觉题，找到你的建筑语言、代表建筑师与建筑作品",
  openGraph: {
    title: "ArcBTI 建筑直觉测试",
    description: "18 道题，找到你的建筑语言、一位代表建筑师和三座建筑",
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
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
