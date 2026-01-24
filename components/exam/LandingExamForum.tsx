/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuestionCard from "./QuestionCard";
import { Exam_GetById } from "@/prisma/functions/Exam/ExamFun";

interface Props {
  exam: Exam_GetById;
  mode?: "grid" | "step"; // step = تمرکز روی یک سوال در هر صفحه
}

const LandingExamForum: React.FC<Props> = ({ exam, mode = "grid" }) => {
  const router = useRouter();
  const startedAt = React.useRef(Date.now());
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  // persist partial progress locally per exam
  const storageKey = React.useMemo(
    () => `exam:${exam?.id}:answers`,
    [exam?.id],
  );

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {}
  }, [answers, storageKey]);

  const questions = exam?.Questions ?? [];
  const total = questions.length;
  const answeredCount = questions.filter(
    (q) => answers[q.id] != null && answers[q.id] !== "",
  ).length;

  const goNext = () => setIdx((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setIdx((i) => Math.max(i - 1, 0));

  const canSubmit = questions.every(
    (q) => !q.isMandatory || (answers[q.id] != null && answers[q.id] !== ""),
  );

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.loading("در حال ارسال پاسخ‌ها و ثبت نتیجه…", { id: "submit-exam" });

    const examId = exam?.id;
    const durationMs = Date.now() - startedAt.current;
    const examVersion = (exam as any)?.version ?? undefined;

    // build answers array from state
    const userAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    const resp = await fetch(`/api/exam/${examId}/submit/landing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationMs, examVersion, userAnswers, examId }),
    });

    setLoading(false);

    if (!resp.ok) {
      const t = await resp.text();
      toast.error(`خطا در ثبت آزمون`, { id: "submit-exam" });
      return;
    }

    const data = await resp.json();
    toast.success("نتیجه ثبت شد.", { id: "submit-exam" });
    localStorage.removeItem(storageKey);
    router.refresh();
    // optionally: router.push(`/exams/${examId}/results/${data.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
      {/* Progress */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          پاسخ‌داده‌شده: {answeredCount} / {total}
        </div>
        <div className='w-56'>
          <Progress value={(answeredCount / Math.max(total, 1)) * 100} />
        </div>
      </div>

      {mode === "grid" ? (
        <div className='grid grid-cols-1 gap-4'>
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              value={answers[q.id] ?? ""}
              isPreviousOneAnswered={
                i === 0 ? true : Boolean(answers[questions[i - 1].id])
              }
              onChange={(v) => setAnswers((s) => ({ ...s, [q.id]: v }))}
            />
          ))}
        </div>
      ) : (
        // step mode (one-by-one)
        <div className='flex flex-col gap-4'>
          <QuestionCard
            question={questions[idx]}
            value={answers[questions[idx]?.id] ?? ""}
            isPreviousOneAnswered={true}
            onChange={(v) =>
              setAnswers((s) => ({ ...s, [questions[idx].id]: v }))
            }
          />
          <div className='flex items-center justify-between'>
            <Button
              type='button'
              variant='secondary'
              onClick={goPrev}
              disabled={idx === 0}
            >
              قبلی
            </Button>
            <div className='text-sm text-muted-foreground'>
              سوال {idx + 1} از {total}
            </div>
            {idx < total - 1 ? (
              <Button type='button' onClick={goNext}>
                بعدی
              </Button>
            ) : (
              <Button
                type='submit'
                variant='accent'
                disabled={loading || !canSubmit}
              >
                ثبت پاسخ‌ها
              </Button>
            )}
          </div>
        </div>
      )}

      {mode === "grid" && (
        <div className='flex justify-end'>
          <Button
            type='submit'
            variant='accent'
            disabled={loading || !canSubmit}
          >
            ثبت پاسخ‌ها
          </Button>
        </div>
      )}
    </form>
  );
};

export default LandingExamForum;
