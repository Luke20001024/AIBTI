"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QUESTIONS, RESULT_BY_CODE, type ResultCode } from "../content";
import { track } from "../domain/analytics";
import { readLocalResult } from "../domain/local-result";
import { buildResultPath } from "../domain/result-view";
import { readQuizSession } from "../domain/session";

export function HomeActions() {
  const [progress, setProgress] = useState(0);
  const [resultCode, setResultCode] = useState<ResultCode | null>(null);

  useEffect(() => {
    track("home_view");
    const session = readQuizSession();
    const result = readLocalResult();
    setProgress(session ? Object.keys(session.answers).length : 0);
    setResultCode(result?.primaryTypeId ?? null);
  }, []);

  const result = resultCode ? RESULT_BY_CODE[resultCode] : null;
  const href = result ? buildResultPath(result.slug, "mine") : "/quiz/";
  const label = result
    ? `查看我的 ${result.code} 结果`
    : progress === QUESTIONS.length
      ? `继续生成结果 · ${QUESTIONS.length} / ${QUESTIONS.length}`
      : progress > 0
        ? `继续上次测试 · ${String(progress).padStart(2, "0")} / ${QUESTIONS.length}`
        : "开始测试";

  return (
    <div className="home-actions">
      <Link className="primary-button" href={href}>
        {label}
        <span aria-hidden="true">→</span>
      </Link>
      <div className="home-facts" aria-label="测试信息">
        <span>18 题</span>
        <span>约 3 分钟</span>
        <span>不用登录</span>
      </div>
      <p className="home-trust">不是心理诊断 · 建筑资料是认真的</p>
    </div>
  );
}
