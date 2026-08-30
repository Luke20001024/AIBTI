import type { Metadata } from "next";
import { VoidV2Sources } from "../../../../features/void-v2/components/void-v2-sources";

export const metadata: Metadata = {
  title: "VOID · 方法与来源",
  description: "VOID 概念候选版的内容边界、建筑事实来源与原型图片授权状态",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VoidV2SourcesPage() {
  return <VoidV2Sources />;
}
