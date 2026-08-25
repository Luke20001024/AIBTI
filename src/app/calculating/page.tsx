import type { Metadata } from "next";
import { Suspense } from "react";
import { CalculatingClient } from "../../components/calculating-client";

export const metadata: Metadata = { title: "正在匹配", robots: { index: false, follow: false } };

export default function CalculatingPage() {
  return <Suspense><CalculatingClient /></Suspense>;
}
