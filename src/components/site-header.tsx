"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isFocusedFlow = pathname.includes("/quiz") || pathname.includes("/calculating");

  if (isFocusedFlow) return null;

  return (
    <header className="site-header">
      <Link className="brand-lockup" href="/" aria-label="返回 ArcBTI 首页">
        <span className="brand-word">Arc<span className="brand-mark">B</span>TI</span>
        <span className="brand-cn">建筑直觉</span>
      </Link>
    </header>
  );
}
