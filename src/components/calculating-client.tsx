"use client";

import { useEffect, useRef, useState } from "react";
import { RESULT_BY_CODE } from "../content";
import { parseCalculationTransfer } from "../domain/calculation-transfer";
import { createLocalResult, writeLocalResult } from "../domain/local-result";
import { startHardNavigation, type HardNavigationHandle } from "../domain/navigation";
import { withBasePath } from "../domain/paths";
import { buildResultPath } from "../domain/result-view";
import { scoreQuiz } from "../domain/scoring";

const MESSAGES = ["测量你的精神承重墙…", "检查曲线有没有蓄意逃跑…", "正在匹配同频建筑师…"];

export function CalculatingClient() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);
  const [status, setStatus] = useState<"working" | "stalled" | "invalid">("working");
  const navigation = useRef<HardNavigationHandle | null>(null);

  useEffect(() => {
    const messageTimer = window.setInterval(
      () => setMessageIndex((value) => Math.min(value + 1, MESSAGES.length - 1)),
      360,
    );

    const routeTimer = window.setTimeout(() => {
      const transfer = parseCalculationTransfer(new URLSearchParams(window.location.hash.replace(/^#/, "")));
      if (!transfer.ok) {
        const target = withBasePath("/quiz/");
        setStatus("invalid");
        setFallbackHref(target);
        return;
      }

      const scored = scoreQuiz(transfer.answers);
      const result = RESULT_BY_CODE[scored.primaryTypeId];
      const localResult = createLocalResult(transfer.answers, scored);
      const storage = writeLocalResult(localResult);
      const target = withBasePath(buildResultPath(result.slug, storage ? "mine" : "share"));
      setFallbackHref(target);

      navigation.current = startHardNavigation({
        href: target,
        mode: "replace",
        timeoutMs: 1500,
        onStalled: () => setStatus("stalled"),
        onError: () => setStatus("stalled"),
      });
    }, 1120);

    return () => {
      window.clearInterval(messageTimer);
      window.clearTimeout(routeTimer);
      navigation.current?.cancel();
    };
  }, []);

  return (
    <main className="calculating-shell" aria-live="polite" aria-busy={status === "working"}>
      <div>
        <div className="calculation-mark" aria-hidden="true" />
        <p className="section-kicker">AIBTI 正在施工</p>
        <h1 className="calculation-title">
          {status === "invalid" ? "这组答案已经过期" : MESSAGES[messageIndex]}
        </h1>
        <p className="calculation-note">
          {status === "invalid"
            ? "题库已经更新，重新作答才能得到可信结果"
            : "答案只在这台设备里计算，不会上传"}
        </p>
        {fallbackHref && status !== "working" && (
          <a className="calculation-fallback" href={fallbackHref}>
            {status === "invalid" ? "重新开始测试 →" : "浏览器没跳转，点这里继续 →"}
          </a>
        )}
      </div>
    </main>
  );
}
