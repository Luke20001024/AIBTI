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
          <p className="section-kicker">AIBTI 正在施工</p>
          <h1 className="calculation-title">先把你的直觉装进来…</h1>
          <p className="calculation-note">答案只在这台设备里计算，不会上传</p>
        </div>
      </main>
    )}>
      <CalculatingClient />
    </Suspense>
  );
}
