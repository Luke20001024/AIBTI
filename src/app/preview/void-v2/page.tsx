import type { Metadata } from "next";
import { VoidV2Page } from "../../../features/void-v2/components/void-v2-page";

export const metadata: Metadata = {
  title: "VOID · 寂静的边界",
  description: "ArcBTI VOID 手机端高密度人格结果页概念候选版",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VoidV2PreviewPage() {
  return <VoidV2Page />;
}
