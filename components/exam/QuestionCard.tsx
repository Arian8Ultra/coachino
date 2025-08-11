/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"; // shadcn
import { CalendarHijri } from "@/components/ui/calendar";
import { Question, QuestionType } from "@/generated/prisma";

type Value = string;

interface Props {
  question: Question;
  value?: Value;
  onChange?: (value: Value) => void;
  className?: string;
  disabled?: boolean;
  isPreviousOneAnswered?: boolean;
}

/** Parse helpers for MULTIPLE_CHOICE serialization */
function parseMulti(v?: string): number[] {
  if (!v) return [];
  try {
    const arr = JSON.parse(v);
    if (Array.isArray(arr)) return arr.map((n) => Number(n)).filter(Number.isFinite);
  } catch {}
  return v
    .split(",")
    .map((s) => Number(s.trim()))
    .filter(Number.isFinite);
}
function toMultiString(arr: number[]): string {
  return JSON.stringify(arr.map((n) => Math.trunc(n)));
}

const QuestionCard: React.FC<Props> = ({
  question,
  value,
  onChange,
  className = "",
  disabled = false,
  isPreviousOneAnswered = true,
}) => {
  const [val, setVal] = React.useState<Value>(value ?? "");

  React.useEffect(() => {
    if (value !== undefined) setVal(value);
  }, [value]);

  React.useEffect(() => {
    onChange?.(val);
  }, [val]);

  const isLocked = !isPreviousOneAnswered;

  const content = (() => {
    switch (question.type) {
      case QuestionType.FiveOption: {
        // Anchored Likert A/B (MBTI-style)
        const labels =
          (question.options?.length ? question.options : [
            "کاملاً به الف نزدیکم",
            "تا حدی به الف نزدیکم",
            "خنثی",
            "تا حدی به ب نزدیکم",
            "کاملاً به ب نزدیکم",
          ]) ?? [];
        const selectedIndex = val ? String(val) : "";
        const anchorA =
          // prefer explicit fields if you added them; else meta snapshot
          (question as any).anchorA ??
          (question as any).meta?.anchors?.a ??
          "الف";
        const anchorB =
          (question as any).anchorB ??
          (question as any).meta?.anchors?.b ??
          "ب";

        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{anchorA}</span>
              <span>{anchorB}</span>
            </div>
            <RadioGroup
              dir="rtl"
              value={selectedIndex}
              onValueChange={(v) => setVal(v)} // store as "0".."4"
              className="grid grid-cols-5 gap-3"
            >
              {labels.slice(0, 5).map((lab, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center gap-2 rounded-md border p-3 hover:bg-accent/50"
                >
                  <RadioGroupItem id={`${question.id}-${idx}`} value={String(idx)} />
                  <Label htmlFor={`${question.id}-${idx}`} className="text-center text-xs leading-5"
                  >
                    {lab}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setVal("")}
                className="text-xs text-muted-foreground underline"
              >
                پاک کردن انتخاب
              </button>
            </div>
          </div>
        );
      }

      case QuestionType.SINGLE_CHOICE: {
        const selectedIndex = val ? Number(val) : NaN;
        return (
          <RadioGroup
            dir="rtl"
            value={Number.isFinite(selectedIndex) ? String(selectedIndex) : ""}
            onValueChange={(v) => setVal(v)} // store index as string
            className="flex flex-col gap-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <RadioGroupItem id={`${question.id}-${index}`} value={String(index)} />
                <Label htmlFor={`${question.id}-${index}`}
                onClick={() => setVal(String(index))}
                >{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      }

      case QuestionType.MULTIPLE_CHOICE: {
        const selected = new Set(parseMulti(val));
        const toggle = (i: number, checked: boolean) => {
          const arr = Array.from(selected);
          if (checked) {
            if (!selected.has(i)) arr.push(i);
          } else {
            const idx = arr.indexOf(i);
            if (idx >= 0) arr.splice(idx, 1);
          }
          setVal(toMultiString(arr.sort((a, b) => a - b))); // store as JSON array string
        };
        return (
          <div className="flex flex-col gap-4">
            <span className="text-xs text-muted-foreground">(چند گزینه قابل انتخاب است)</span>
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2" 
              onClick={() => toggle(index, !selected.has(index))}
              >
                <Checkbox
                  checked={selected.has(index)}
                  onCheckedChange={(c) => toggle(index, Boolean(c))}
                />
                <span>{option}</span>
              </label>
            ))}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setVal("[]")}
                className="text-xs text-muted-foreground underline"
              >
                پاک کردن انتخاب‌ها
              </button>
            </div>
          </div>
        );
      }

      case QuestionType.TEXT: {
        return (
          <div className="flex flex-col gap-2">
            <Input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="پاسخ خود را اینجا بنویسید"
            />
          </div>
        );
      }

      case QuestionType.DATE: {
        return (
          <div className="flex flex-col gap-2">
            <CalendarHijri
              value={val}
              onChange={(date) => setVal(String(date ?? ""))}
              className="w-full"
            />
          </div>
        );
      }

      default:
        return (
          <div className="flex flex-col gap-2">
            <Input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="پاسخ خود را اینجا بنویسید"
            />
          </div>
        );
    }
  })();

  return (
    <Card
      className={`w-full bg-glass border-glass border min-h-[260px] focus-within:outline-2 outline-blue-600 duration-300 ${className}`}
      style={{
        filter: isLocked ? "grayscale(0.5) blur(4px)" : "none",
        opacity: isLocked ? 0.6 : 1,
        transition: "filter 0.25s, opacity 0.25s",
      }}
      aria-disabled={isLocked || disabled}
    >
      <CardHeader>
        <CardTitle className="leading-7">
          {question.question}
          {!question.isMandatory ? <span className="mr-2 text-red-500">
            (اختیاری)
          </span> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="rounded-lg">{isLocked ? <LockedHint /> : content}</CardContent>
    </Card>
  );
};

const LockedHint: React.FC = () => (
  <div className="flex items-center justify-center h-24">
    <span className="text-gray-500">لطفاً سؤال قبلی را پاسخ دهید</span>
  </div>
);

export default QuestionCard;
