import type { Metadata } from "next";
import { QuizRunner } from "../../components/quiz-runner";

export const metadata: Metadata = {
  title: "开始测试",
  robots: { index: false, follow: false },
};

export default function QuizPage() {
  return <QuizRunner />;
}
