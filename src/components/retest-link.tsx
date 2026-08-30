"use client";

import type { ReactNode } from "react";
import type { ResultCode } from "../content";
import { track } from "../domain/analytics";
import { clearLocalResult } from "../domain/local-result";
import { withBasePath } from "../domain/paths";
import { clearQuizSession } from "../domain/session";

type RetestLinkProps = {
  resultCode: ResultCode;
  children?: ReactNode;
  className?: string;
};

export function RetestLink({
  resultCode,
  children = "清空并重新测试 →",
  className = "restart-link",
}: RetestLinkProps) {
  return (
    <a
      className={className || undefined}
      href={withBasePath("/quiz/?reset=1")}
      onClick={() => {
        track("retest_click", { resultCode });
        clearQuizSession();
        clearLocalResult();
      }}
    >
      {children}
    </a>
  );
}
