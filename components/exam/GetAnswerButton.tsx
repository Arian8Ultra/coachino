"use client";
import React from "react";
import { toast } from "sonner";

interface Props {
  examId: string;
  token: string;
  className?: string;
}
const GetAnswerButton = ({ examId, token, className }: Props) => {
  const handleGetAnswer = async () => {
    try {
      toast.loading("Fetching answers...", {
        id: "exam-result",
      });
      const result = await fetch("/api/exam/answer/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId: examId }),
      });
      if (result.ok) {
        const data = await result.json();
        toast.success(`Exam result: ${data}`, {
          id: "exam-result",
        });
      } else {
        const errorText = await result.text();
        toast.error(`Error fetching result: ${errorText}`, {
          id: "exam-result",
        });
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };
  return (
    <div
      className={
        "p-[2px] bg-gradient-to-r from-blue-500 to-pink-500 rounded-full" +
        (className ? ` ${className}` : "")
      }
    >
      <button
        onClick={handleGetAnswer}
        className={
          "px-4 py-2 hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500 text-white rounded hover:opacity-90 transition duration-300 w-full bg-background" +
          (className ? ` ${className}` : "")
        }
      >
        Get Answers
      </button>
    </div>
  );
};

export default GetAnswerButton;
