"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS, type OptionId } from "../content";
import { track } from "../domain/analytics";
import { buildCalculationHref } from "../domain/calculation-transfer";
import { startHardNavigation, type HardNavigationHandle } from "../domain/navigation";
import type { AnswerMap } from "../domain/scoring";
import { readQuizSession, writeQuizSession } from "../domain/session";
import { hasGeneratedQuestionVisual, QuestionVisual } from "./question-visual";

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
  const [storageAvailable, setStorageAvailable] = useState(true);
  const navigation = useRef<HardNavigationHandle | null>(null);
  const question = QUESTIONS[index];
  const selected = answers[question.id];
  const isFinalQuestion = index === QUESTIONS.length - 1;

  useEffect(() => {
    track("quiz_start");
    const session = readQuizSession();
    if (session) {
      setAnswers(session.answers);
      setIndex(session.index);
      setStorageAvailable(Boolean(writeQuizSession(session)));
    }
    setReady(true);
    return () => {
      navigation.current?.cancel();
    };
  }, []);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = ((index + 1) / QUESTIONS.length) * 100;

  const persist = (nextAnswers: AnswerMap, nextIndex: number) => {
    const stored = writeQuizSession({ answers: nextAnswers, index: nextIndex, updatedAt: Date.now() });
    setStorageAvailable(Boolean(stored));
  };

  const finish = () => {
    if (finishing) return;

    let target: string;
    try {
      target = buildCalculationHref(answers);
    } catch {
      const firstMissingIndex = QUESTIONS.findIndex((item) => !answers[item.id]);
      if (firstMissingIndex >= 0) {
        setIndex(firstMissingIndex);
        persist(answers, firstMissingIndex);
        setCompletionError(`还差第 ${firstMissingIndex + 1} 题，补完就能出结果`);
      } else {
        setCompletionError("答案没有成功打包，请再点一次确认");
      }
      return;
    }

    setFinishing(true);
    setFallbackHref(target);
    setCompletionError(null);
    track("quiz_complete", { questionCount: QUESTIONS.length });
    navigation.current = startHardNavigation({
      href: target,
      mode: "assign",
      timeoutMs: 1500,
      onStalled: () => {
        setFinishing(false);
        setCompletionError("浏览器没有自动跳转，请点下面的继续入口");
      },
      onError: () => {
        setFinishing(false);
        setCompletionError("浏览器拦住了自动跳转，请点下面的继续入口");
      },
    });
  };

  const select = (optionId: OptionId) => {
    if (finishing) return;
    setCompletionError(null);
    setFallbackHref(null);
    const nextAnswers = { ...answers, [question.id]: optionId };
    track("question_answer", { questionId: question.id, position: question.order });
    setAnswers(nextAnswers);

    if (isFinalQuestion) {
      persist(nextAnswers, index);
      return;
    }

    const nextIndex = index + 1;
    persist(nextAnswers, nextIndex);
    setIndex(nextIndex);
  };

  const back = () => {
    if (finishing) return;
    if (index === 0) {
      router.push("/");
      return;
    }
    const nextIndex = index - 1;
    setIndex(nextIndex);
    persist(answers, nextIndex);
    setCompletionError(null);
    setFallbackHref(null);
  };

  if (!ready) {
    return (
      <main className="narrow-shell quiz-shell quiz-shell-loading" aria-busy="true">
        <div className="quiz-progress" aria-hidden="true">
          <div className="quiz-progress-line">
            <div className="quiz-progress-value" style={{ width: `${100 / QUESTIONS.length}%` }} />
          </div>
          <div className="quiz-progress-meta">
            <span>AIBTI</span>
            <span>— / {QUESTIONS.length}</span>
          </div>
        </div>
        <section className="quiz-loading" role="status" aria-live="polite">
          <span className="quiz-loading-mark" aria-hidden="true" />
          <p>正在读取测试进度</p>
          <div aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </section>
        <footer className="quiz-footer quiz-loading-footer" aria-hidden="true">
          <span>18 道短题</span>
          <span>准备交互</span>
        </footer>
      </main>
    );
  }

  return (
    <main className="narrow-shell quiz-shell" aria-busy={finishing}>
      <header className="quiz-brand" aria-label="AIBTI 建筑人格">
        <span><b>AI</b>BTI</span>
        <i aria-hidden="true" />
        <strong>{GROUP_LABELS[question.kind]}</strong>
      </header>

      <div className="quiz-progress">
        <div className="quiz-progress-count">
          <strong>{index + 1}</strong>
          <span>/ {QUESTIONS.length}</span>
        </div>
        <div className="quiz-progress-line" aria-hidden="true">
          <div className="quiz-progress-value" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="question-block" aria-labelledby="question-title" key={question.id}>
        <h1 className="question-title" id="question-title">{question.prompt}</h1>
        <div
          className={`option-list ${question.kind === "aesthetic" ? "option-list-visual" : ""}`}
          role="radiogroup"
          aria-label={question.prompt}
        >
          {question.options.map((option, optionIndex) => {
            const optionSelected = selected === option.id;
            return (
              <button
                className={`quiz-option ${question.kind === "aesthetic" ? "aesthetic-option" : ""} ${optionSelected ? "selected" : ""}`}
                key={option.id}
                type="button"
                role="radio"
                aria-checked={optionSelected}
                disabled={finishing}
                onClick={() => select(option.id)}
              >
                <span className="option-letter">{option.id}</span>
                {hasGeneratedQuestionVisual(question.id) && (
                  <span className="question-visual-wrap">
                    <QuestionVisual questionId={question.id} optionIndex={optionIndex} label={option.label} />
                  </span>
                )}
                <span className="option-content">
                  <span className="option-label">{option.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {isFinalQuestion && (
          <button
            className="primary-button quiz-submit"
            type="button"
            disabled={!selected || finishing}
            onClick={finish}
          >
            {finishing ? "正在打开结果…" : "确认这就是我 →"}
          </button>
        )}

        {completionError && (
          <p className="quiz-completion-error" role="alert">
            <span>{completionError}</span>
            {fallbackHref && <a href={fallbackHref}>继续计算 →</a>}
          </p>
        )}
      </section>

      <footer className="quiz-footer">
        <button className="text-button" type="button" disabled={finishing} onClick={back}>← 上一题</button>
        <span className="quiz-note" aria-live="polite">
          {finishing
            ? "正在生成结果…"
            : storageAvailable
              ? `已答 ${answeredCount} 题 · 自动保存`
              : `已答 ${answeredCount} 题 · 浏览器未保存`}
        </span>
      </footer>
    </main>
  );
}
