import type { Metadata } from "next";
import { PersonaDirectory } from "../../features/persona-directory/persona-directory";

export const metadata: Metadata = {
  title: "16 种建筑人格",
  description: "从骨架、场所、记忆与改写四组判断，查看 ArcBTI 的 16 种建筑人格",
};

export default function ResultDirectoryPage() {
  return <PersonaDirectory />;
}
