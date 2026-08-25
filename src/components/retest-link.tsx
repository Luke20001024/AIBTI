"use client";

import type { ResultCode } from "../content";
import { track } from "../domain/analytics";
import { clearLocalResult } from "../domain/local-result";
import { withBasePath } from "../domain/paths";
import { clearQuizSession } from "../domain/session";

export function RetestLink({ resultCode }: { resultCode: ResultCode }) {
  return (
    <a
      className="restart-link"
      href={withBasePath("/quiz/")}
      onClick={() => {
        track("retest_click", { resultCode });
        clearQuizSession();
        clearLocalResult();
      }}
    >
      清空并重新测试 →
    </a>
  );
}
