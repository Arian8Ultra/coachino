/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { $Enums, Question, QuestionType } from "@/generated/prisma";
import React, { useEffect } from "react";

// import CInput from "./CInput/CInput";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

interface Props {
  inputType: QuestionType;
  question?: Question;
  value?: string | number | boolean | string[];
  onChange?: (value: string | number | boolean | string[]) => void;
  className?: string;
}
const QuestionCard = ({
  inputType,
  question,
  className,
  onChange,
  value,
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
    <Card className={"w-full bg-sidebar-border/50 " + className}>
      <CardHeader>
        <CardTitle>{question.question}</CardTitle>
      </CardHeader>
      <CardContent>
        {CIComp(inputType, question, inputValue, setinputValue, value)}
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
        <div className='flex flex-col gap-2'>
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
        <div className='flex flex-col gap-2'>
          <label className='font-semibold text-xs'>Multiple Choice</label>
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
        <div className='flex flex-col gap-2'>
          {/* <label className='font-semibold'>{question.question}</label> */}
          <Input
            value={inputValue as string}
            onChange={(e) => setinputValue(e.target.value)}
            placeholder='Type your answer here'
          />
        </div>
      );
    case "DATE":
      return (
        <div className='flex flex-col gap-2'>
          {/* <label className='font-semibold'>{question.question}</label> */}
          <Input
            type='date'
            value={inputValue as string}
            onChange={(e) => setinputValue(e.target.value)}
          />
        </div>
      );
    default:
      return (
        <div className='flex flex-col gap-2'>
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
