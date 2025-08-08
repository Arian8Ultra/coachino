/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { $Enums, Question, QuestionType } from "@/generated/prisma";
import React, { useEffect } from "react";

// import CInput from "./CInput/CInput";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { CalendarHijri } from "../ui/calendar";

interface Props {
  inputType: QuestionType;
  question?: Question;
  value?: string | number | boolean | string[];
  onChange?: (value: string | number | boolean | string[]) => void;
  className?: string;
  isPreviousOneAnswered?: boolean;
}
const QuestionCard = ({
  inputType,
  question,
  className,
  onChange,
  value,
  isPreviousOneAnswered = false,
}: Props) => {
  const [inputValue, setinputValue] = React.useState<
    string | number | boolean | string[]
  >("");

  useEffect(() => {
    if (value !== undefined) {
      setinputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (onChange) {
      onChange(inputValue);
    }
  }, [inputValue]);

  if (!question) {
    return null;
  }

  // const CI = CIComp(inputType, question, inputValue, setinputValue, value);

  return (
    <Card
      className={
        "w-full bg-glass border-glass border min-h-[300px] h-full focus-within:outline-2 outline-blue-600 duration-300" +
        className
      }
      style={{
        filter: !isPreviousOneAnswered ? "grayscale(0.5) blur(5px)" : "none",
        opacity: !isPreviousOneAnswered ? 0.5 : 1,
        transition: "filter 0.3s, opacity 0.3s",
      }}
    >
      <CardHeader>
        <CardTitle className='leading-7'>{question.question}</CardTitle>
      </CardHeader>
      <CardContent className='rounded-lg h-full'>
        {isPreviousOneAnswered ? (
          CIComp(inputType, question, inputValue, setinputValue, value)
        ) : (
          <div className='flex items-center justify-center h-full'>
            <span className='text-gray-500'>لطفا سوال قبلی را پاسخ دهید</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
function CIComp(
  inputType: string,
  question: {
    question: string;
    id: string;
    examId: string;
    options: string[];
    type: $Enums.QuestionType;
    isMandatory: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  inputValue: string | number | boolean | string[],
  setinputValue: React.Dispatch<
    React.SetStateAction<string | number | boolean | string[]>
  >,
  value: string | number | boolean | string[] | undefined,
) {
  switch (inputType) {
    case "SINGLE_CHOICE":
      return (
        <div className='flex flex-col gap-5'>
          {/* <label className='font-semibold'>{question.question}</label> */}
          {question.options.map((option, index) => (
            <div key={index} className='flex items-center gap-2'>
              <Checkbox
                checked={inputValue === option}
                onCheckedChange={(checked) => {
                  setinputValue(checked ? option : "");
                }}
              />
              <span>{option}</span>
            </div>
          ))}
        </div>
      );
    case "MULTIPLE_CHOICE":
      return (
        <div className='flex flex-col gap-5'>
          <label className='font-semibold text-xs'>
            (چند گزینه قابل انتخاب است)
          </label>
          {question.options.map((option, index) => (
            <div key={index} className='flex items-center gap-2'>
              <Checkbox
                checked={(inputValue as string[]).includes(option)}
                onCheckedChange={(checked) => {
                  const newValue = checked
                    ? [...(value as string[]), option]
                    : (value as string[]).filter((v) => v !== option);
                  setinputValue(newValue);
                }}
              />
              <span>{option}</span>
            </div>
          ))}
        </div>
      );
    case "TEXT":
      return (
        <div className='flex flex-col gap-2 h-full justify-end'>
          {/* <label className='font-semibold'>{question.question}</label> */}
          <Input
            value={inputValue as string}
            onChange={(e) => setinputValue(e.target.value)}
            placeholder='پاسخ خود را اینجا بنویسید'
          />
        </div>
      );
    case "DATE":
      return (
        <div className='flex flex-col gap-2 h-full justify-end'>
          {/* <label className='font-semibold'>{question.question}</label> */}
          <CalendarHijri
            value={inputValue as string}
            onChange={(date) => setinputValue(date)}
            className='w-full'
          />
        </div>
      );
    default:
      return (
        <div className='flex flex-col gap-2 h-full justify-end'>
          {/* <label className='font-semibold'>{question.question}</label> */}
          <Input
            type='text'
            value={inputValue as string}
            onChange={(e) => setinputValue(e.target.value)}
            placeholder='Type your answer here'
          />
        </div>
      );
  }
}
