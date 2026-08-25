"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS, type OptionId } from "../content";
import { track } from "../domain/analytics";
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
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = QUESTIONS[index];
  const selected = answers[question.id];

  useEffect(() => {
    track("quiz_start");
    const session = readQuizSession();
    if (session) {
      setAnswers(session.answers);
      setIndex(Math.min(Math.max(session.index, 0), QUESTIONS.length - 1));
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
    persist(nextAnswers, QUESTIONS.length - 1);
    track("quiz_complete", { questionCount: QUESTIONS.length });
    router.push(`/calculating/?a=${encodeAnswers(nextAnswers)}`);
  };

  const select = (optionId: OptionId) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    const nextAnswers = { ...answers, [question.id]: optionId };
    track("question_answer", { questionId: question.id, position: question.order });
    setAnswers(nextAnswers);

    if (index === QUESTIONS.length - 1) {
      advanceTimer.current = setTimeout(() => finish(nextAnswers), 260);
      return;
    }

    const nextIndex = index + 1;
    persist(nextAnswers, nextIndex);
    advanceTimer.current = setTimeout(() => setIndex(nextIndex), 230);
  };

  const back = () => {
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
    <main className="narrow-shell quiz-shell">
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
              onClick={() => select(option.id)}
            >
              <span className="option-letter">{option.id}</span>
              {option.visual && <span className={`aesthetic-visual visual-${option.visual}`} aria-hidden="true" />}
              <span className="option-content"><span className="option-label">{option.label}</span></span>
            </button>
          ))}
        </div>
      </section>

      <footer className="quiz-footer">
        <button className="text-button" type="button" onClick={back}>← 上一题</button>
        <span className="quiz-note">已答 {answeredCount} 题 · 自动保存</span>
      </footer>
    </main>
  );
}
