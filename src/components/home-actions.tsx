"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QUESTIONS } from "../content";
import { track } from "../domain/analytics";
import { readQuizSession } from "../domain/session";

export function HomeActions() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    track("home_view");
    const session = readQuizSession();
    setProgress(session ? Object.keys(session.answers).length : 0);
  }, []);

  return (
    <div className="home-actions">
      <Link className="primary-button" href="/quiz/">
        {progress > 0 && progress < QUESTIONS.length ? `继续施工 · ${progress}/${QUESTIONS.length}` : "开始测试"}
        <span aria-hidden="true">→</span>
      </Link>
      <div className="home-facts" aria-label="测试信息">
        <span>18 道短题</span>
        <span>约 3 分钟</span>
        <span>无需登录</span>
      </div>
    </div>
  );
}
