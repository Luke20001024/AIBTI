"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RESULT_BY_CODE } from "../content";
import { withBasePath } from "../domain/paths";
import { decodeAnswers, scoreQuiz } from "../domain/scoring";

const MESSAGES = ["测量你的精神承重墙…", "检查曲线是否蓄意逃跑…", "正在匹配建筑人格…"];

export function CalculatingClient() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("a");
  const [messageIndex, setMessageIndex] = useState(0);
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);

  useEffect(() => {
    const messageTimer = window.setInterval(() => setMessageIndex((value) => Math.min(value + 1, MESSAGES.length - 1)), 430);
    const routeTimer = window.setTimeout(() => {
      let target = withBasePath("/quiz/");
      try {
        if (!encoded) throw new Error("No answers");
        const scored = scoreQuiz(decodeAnswers(encoded));
        const result = RESULT_BY_CODE[scored.primaryTypeId];
        target = withBasePath(`/result/${result.slug}/?a=${encoded}&q=1&s=1`);
      } catch {
        // Invalid or incomplete answer codes restart the quiz with a full load.
      }

      setFallbackHref(target);
      try {
        window.location.replace(target);
      } catch {
        // The rendered anchor is the user-operated fallback for restricted hosts.
      }
    }, 1320);

    return () => {
      window.clearInterval(messageTimer);
      window.clearTimeout(routeTimer);
    };
  }, [encoded]);

  return (
    <main className="calculating-shell" aria-live="polite" aria-busy="true">
      <div>
        <div className="calculation-mark" aria-hidden="true" />
        <p className="section-kicker">AIBTI 正在施工</p>
        <h1 className="calculation-title">{MESSAGES[messageIndex]}</h1>
        <p className="calculation-note">不会上传你的答案。这里只有一点浏览器内计算，和适量玄学。</p>
        {fallbackHref && <a className="calculation-fallback" href={fallbackHref}>没有自动跳转？点这里继续 →</a>}
      </div>
    </main>
  );
}
