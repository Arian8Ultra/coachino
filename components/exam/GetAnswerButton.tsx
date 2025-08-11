"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  examId: string;
  token: string;
  className?: string;
}
const GetAnswerButton = ({ examId, className }: Props) => {
  const router = useRouter();
  const handleGetAnswer = async () => {
    try {
      toast.loading("دریافت پاسخ...", {
        id: "exam-result",
      });
      const result = await fetch(`/api/exam/${examId}/score?examId=${examId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (result.ok) {
        // const data = await result.json();
        toast.success(`پاسخ آزمون دریافت شد`, {
          id: "exam-result",
        });
        router.refresh();
      } else {
        const errorText = await result.text();
        toast.error(`خطا در دریفت پاسخ: ${errorText}`, {
          id: "exam-result",
        });
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };
  return (
    <Button
      onClick={handleGetAnswer}
      variant={"accent"}
      className={cn("p-6", className)}
    >
      دریافت پاسخ آزمون
    </Button>
  );
};

export default GetAnswerButton;
