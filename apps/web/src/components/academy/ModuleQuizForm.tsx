"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PageMessages } from "@os-community/shared";

type QuizItem = {
  id: string;
  type: string;
  stem: string;
  choices?: { id: string; text: string }[];
};

type QuizForm = {
  id: string;
  name: string;
  pass_score?: number;
  time_limit_minutes?: number;
};

type GradeItemResult = {
  item_id: string;
  correct: boolean;
  explanation: string;
};

type GradeResult = {
  score: number;
  pass: boolean;
  pass_score: number;
  items: GradeItemResult[];
};

type AcademyLabels = PageMessages["academy"];

type Props = {
  trackId: string;
  bankId: string;
  formId: string;
  form: QuizForm;
  items: QuizItem[];
  timeLimitMinutes: number;
  passScore: number;
  moduleSlug?: string;
  issueCertificationId?: string;
  labels: AcademyLabels;
};

function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function ModuleQuizForm({
  trackId,
  bankId,
  formId,
  form,
  items,
  timeLimitMinutes,
  passScore,
  moduleSlug,
  issueCertificationId,
  labels: a,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [certificateNo, setCertificateNo] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsedMinutes = Math.floor((now - startedAt) / 60000);
  const remainingMinutes = Math.max(timeLimitMinutes - elapsedMinutes, 0);
  const timedOut = remainingMinutes === 0;

  async function submitQuiz() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/exams/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankId,
          formId,
          trackId,
          moduleSlug,
          answers: items.map((item) => ({ item_id: item.id, choice_id: answers[item.id] })),
        }),
      });
      const body = (await res.json()) as {
        result?: GradeResult;
        error?: string | { message?: string };
      };
      if (!res.ok) {
        const message =
          typeof body.error === "string"
            ? body.error
            : body.error?.message ?? a.gradeFailed;
        throw new Error(message);
      }
      setResult(body.result ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : a.gradeFailed);
    } finally {
      setSubmitting(false);
    }
  }

  async function issueCertificate() {
    if (!issueCertificationId) return;
    setIssuing(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificationId: issueCertificationId }),
      });
      const body = (await res.json()) as { certificate?: { certificateNo: string }; error?: string };
      if (!res.ok) throw new Error(body.error ?? a.issueFailed);
      setCertificateNo(body.certificate?.certificateNo ?? null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : a.issueFailed);
    } finally {
      setIssuing(false);
    }
  }

  if (result) {
    return (
      <div className="academy-quiz-result">
        <h2 className="section-title">{a.quizResultTitle}</h2>
        <p className={result.pass ? "academy-quiz-pass" : "academy-quiz-fail"}>
          {fillTemplate(a.quizScoreLine, {
            score: result.score,
            pass: result.pass_score,
            result: result.pass ? a.quizPass : a.quizFail,
          })}
        </p>
        {result.pass && issueCertificationId && !certificateNo && (
          <p style={{ marginTop: "1rem" }}>
            <button type="button" className="btn btn-primary btn-sm" disabled={issuing} onClick={issueCertificate}>
              {issuing ? a.issuing : a.issueCert}
            </button>
          </p>
        )}
        {certificateNo && (
          <p className="academy-quiz-pass">
            {a.certNo}: {certificateNo}
          </p>
        )}
        <div className="academy-quiz-review">
          {result.items.map((item) => {
            const quizItem = items.find((i) => i.id === item.item_id);
            return (
              <div key={item.item_id} className="lf-card" style={{ marginBottom: "0.75rem" }}>
                <p>
                  <strong>{item.correct ? "✓" : "✗"}</strong> {quizItem?.stem}
                </p>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{item.explanation}</p>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: "1rem" }}>
          <Link href={`/academy/tracks/${trackId}`} className="btn btn-primary btn-sm">
            {a.backToTrack}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="academy-quiz-form">
      <div className="academy-quiz-meta">
        <span>{form.name}</span>
        <span>
          {a.quizTimeLimit}: {timeLimitMinutes} {a.minutes} / {a.quizRemaining} {remainingMinutes}{" "}
          {a.minutes} / {a.quizPassScore} {passScore}%
        </span>
      </div>
      {items.map((item, index) => (
        <fieldset key={item.id} className="lf-card academy-quiz-item">
          <legend>
            {a.quizQuestion} {index + 1}. {item.stem}
          </legend>
          {(item.choices ?? []).map((choice) => (
            <label key={choice.id} className="academy-quiz-choice">
              <input
                type="radio"
                name={item.id}
                value={choice.id}
                checked={answers[item.id] === choice.id}
                onChange={() => setAnswers((prev) => ({ ...prev, [item.id]: choice.id }))}
              />
              <span>
                {choice.id}. {choice.text}
              </span>
            </label>
          ))}
        </fieldset>
      ))}
      {error && <p className="academy-progress-error">{error}</p>}
      <button
        type="button"
        className="btn btn-primary"
        disabled={submitting || timedOut || items.some((item) => !answers[item.id])}
        onClick={submitQuiz}
      >
        {submitting ? a.quizSubmitting : timedOut ? a.quizTimedOut : a.quizSubmit}
      </button>
    </div>
  );
}
