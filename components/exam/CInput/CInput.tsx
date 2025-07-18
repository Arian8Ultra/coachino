import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Question, QuestionType } from "@/generated/prisma";
import React from "react";
interface Props {
  inputType: QuestionType;
  question: Question;
  value?: string | number | boolean | string[];
  onChange?: (value: string | number | boolean | string[]) => void;
  className?: string;
  inputValue: string | number | boolean | string[];
  setinputValue: React.Dispatch<
    React.SetStateAction<string | number | boolean | string[]>
  >;
}
const CInput = ({
  inputType,
  question,
  value,
  inputValue,
  setinputValue,
}: Props) => {
  switch (inputType) {
    case "SINGLE_CHOICE":
      return (
        <div className='flex flex-col gap-2'>
          <label className='font-semibold'>{question.question}</label>
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
          <label className='font-semibold'>{question.question}</label>
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
        <Input
          value={inputValue as string}
          onChange={(e) => setinputValue(e.target.value)}
          placeholder='Type your answer here'
        />
      );
    case "DATE":
      return (
        <Input
          type='date'
          value={inputValue as string}
          onChange={(e) => setinputValue(e.target.value)}
        />
      );
    default:
      return (
        <Input
          type='text'
          value={inputValue as string}
          onChange={(e) => setinputValue(e.target.value)}
          placeholder='Type your answer here'
        />
      );
  }
};

export default CInput;
