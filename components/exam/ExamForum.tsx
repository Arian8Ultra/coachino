"use client";
import { Exam_GetById } from "@/prisma/functions/Exam/ExamFun";
import React from "react";
import QuestionCard from "./QuestionCard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface Props {
  exam: Exam_GetById;
  token?: string;
}
const ExamForum = ({ exam, token }: Props) => {
  const [inputs, setInputs] = React.useState<{ [key: string]: string }>({});
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    toast.loading("درحال ارسال پاسخ ها...", {
      id: "submit-exam",
    });
    e.preventDefault();
    const res = await fetch("/api/exam/answer/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        examId: exam?.id,
        userAnswers: Object.entries(inputs).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      }),
    });
    if (res.ok) {
      toast.success("پاسخ ها با موفقیت ثبت شدند", {
        id: "submit-exam",
      });
      const result = await fetch("/api/exam/answer/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId: exam?.id }),
      });
      if (result.ok) {
        const data = await result.json();
        toast.success(`پاسخ آزمون: ${data}`, {
          id: "exam-result",
        });
        router.refresh();
      } else {
        const errorText = await result.text();
        toast.error(`خطا در دریافت پاسخ آزمون: ${errorText}`, {
          id: "exam-result",
        });
      }
    } else {
      const errorText = await res.text();
      toast.error(`خطا در ثبت پاسخ ها: ${errorText}`, {
        id: "submit-exam",
      });
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
    >
      {exam?.Questions.map((question) => (
        <QuestionCard
          question={question}
          inputType={question.type}
          key={question.id}
          value={inputs[question.id] || ""}
          onChange={(value) => {
            setInputs({
              ...inputs,
              [question.id]: value as string,
            });
          }}
        />
      ))}
      <button
        type='submit'
        className='col-span-full bg-blue-500 text-white p-2 rounded'
      >
        ثبت پاسخ‌ها
      </button>
    </form>
  );
};

export default ExamForum;
