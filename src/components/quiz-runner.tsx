"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS, type OptionId } from "../content";
import { track } from "../domain/analytics";
import { withBasePath } from "../domain/paths";
import { encodeAnswers, type AnswerMap } from "../domain/scoring";
import { readQuizSession, writeQuizSession } from "../domain/session";

const GROUP_LABELS = {
  projective: "潜意识施工",
  personality: "日常人格",
  aesthetic: "建筑直觉",
} as const;

export function QuizRunner() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [ready, setReady] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = QUESTIONS[index];
  const selected = answers[question.id];

  useEffect(() => {
    track("quiz_start");
    const session = readQuizSession();
    if (session) {
      setAnswers(session.answers);
      setIndex(session.index);
      writeQuizSession(session);
    }
    setReady(true);
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = ((index + 1) / QUESTIONS.length) * 100;

  const persist = (nextAnswers: AnswerMap, nextIndex: number) => {
    writeQuizSession({ answers: nextAnswers, index: nextIndex, updatedAt: Date.now() });
  };

  const finish = (nextAnswers: AnswerMap) => {
    try {
      const encoded = encodeAnswers(nextAnswers);
      const target = withBasePath(`/calculating/?a=${encoded}`);
      setFallbackHref(target);
      track("quiz_complete", { questionCount: QUESTIONS.length });

      // A full navigation is more reliable than History API routing in HarmonyOS,
      // embedded browsers, and older WebViews. The visible link below remains as a
      // user-operated fallback if the host browser blocks programmatic navigation.
      window.location.assign(target);
    } catch {
      const firstMissingIndex = QUESTIONS.findIndex((item) => !nextAnswers[item.id]);
      if (firstMissingIndex >= 0) {
        setIndex(firstMissingIndex);
        persist(nextAnswers, firstMissingIndex);
        setFallbackHref(null);
        setCompletionError(`检测到旧进度缺少第 ${firstMissingIndex + 1} 题，请补答后再计算。`);
      } else {
        setCompletionError("当前浏览器没有完成自动跳转，请点下方链接继续计算。");
      }
      setFinishing(false);
    }
  };

  const select = (optionId: OptionId) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setCompletionError(null);
    setFallbackHref(null);
    const nextAnswers = { ...answers, [question.id]: optionId };
    track("question_answer", { questionId: question.id, position: question.order });
    setAnswers(nextAnswers);

    if (index === QUESTIONS.length - 1) {
      persist(nextAnswers, index);
      setFinishing(true);
      advanceTimer.current = setTimeout(() => finish(nextAnswers), 260);
      return;
    }

    const nextIndex = index + 1;
    persist(nextAnswers, nextIndex);
    advanceTimer.current = setTimeout(() => setIndex(nextIndex), 230);
  };

  const back = () => {
    if (finishing) return;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (index === 0) {
      router.push("/");
      return;
    }
    const nextIndex = index - 1;
    setIndex(nextIndex);
    persist(answers, nextIndex);
  };

  if (!ready) return <main className="narrow-shell quiz-shell" aria-busy="true" />;

  return (
    <main className="narrow-shell quiz-shell" aria-busy={finishing}>
      <div>
        <div className="quiz-progress-line" aria-hidden="true">
          <div className="quiz-progress-value" style={{ width: `${progress}%` }} />
        </div>
        <div className="quiz-progress-meta">
          <span>{GROUP_LABELS[question.kind]}</span>
          <span>{String(index + 1).padStart(2, "0")} / {QUESTIONS.length}</span>
        </div>
      </div>

      <section className="question-block" aria-labelledby="question-title" key={question.id}>
        <p className="question-eyebrow">{question.eyebrow}</p>
        <h1 className="question-title" id="question-title">{question.prompt}</h1>
        <div className="option-list" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option) => (
            <button
              className={`quiz-option ${question.kind === "aesthetic" ? "aesthetic-option" : ""} ${selected === option.id ? "selected" : ""}`}
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected === option.id}
              disabled={finishing}
              onClick={() => select(option.id)}
            >
              <span className="option-letter">{option.id}</span>
              {option.visual && <span className={`aesthetic-visual visual-${option.visual}`} aria-hidden="true" />}
              <span className="option-content"><span className="option-label">{option.label}</span></span>
            </button>
          ))}
        </div>
        {completionError && (
          <p className="quiz-completion-error" role="alert">
            <span>{completionError}</span>
            {fallbackHref && <a href={fallbackHref}>直接打开计算页 →</a>}
          </p>
        )}
      </section>

      <footer className="quiz-footer">
        <button className="text-button" type="button" disabled={finishing} onClick={back}>← 上一题</button>
        <span className="quiz-note" aria-live="polite">
          {finishing ? "正在生成结果…" : `已答 ${answeredCount} 题 · 自动保存`}
        </span>
      </footer>
    </main>
  );
}
