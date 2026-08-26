import type { Metadata } from "next";
import { Suspense } from "react";
import { CalculatingClient } from "../../components/calculating-client";

export const metadata: Metadata = { title: "正在匹配", robots: { index: false, follow: false } };

export default function CalculatingPage() {
  return (
    <Suspense fallback={(
      <main className="calculating-shell" aria-busy="true">
        <div>
          <div className="calculation-mark" aria-hidden="true" />
          <p className="section-kicker">ArcBTI 正在匹配</p>
          <h1 className="calculation-title">正在寻找你的建筑语言…</h1>
          <p className="calculation-note">答案只在这台设备里计算，不会上传</p>
        </div>
      </main>
    )}>
      <CalculatingClient />
    </Suspense>
  );
}
