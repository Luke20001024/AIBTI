"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isFocusedFlow = pathname.includes("/quiz") || pathname.includes("/calculating");

  if (isFocusedFlow) return null;

  return (
    <header className="site-header">
      <Link className="brand-lockup" href="/" aria-label="返回 AIBTI 首页">
        <span className="brand-mark">AI</span>
        <span className="brand-word">BTI</span>
        <span className="brand-cn">建筑人格</span>
      </Link>
    </header>
  );
}
