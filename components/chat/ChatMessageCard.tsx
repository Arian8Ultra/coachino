import { QuestionType } from "@/generated/prisma";
import { JsonValue } from "@/generated/prisma/runtime/library";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import ChatRecommendedScenarioCard from "../panel/scenario/ChatRecommendedScenarioCard";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import ChatQuestionCard from "./ChatQuestionCard";

type Msg = {
  role: "user" | "assistant";
  content: string;
  type?: "link" | "question" | "text" | "scenario_recommendation";
  url?: string;
  text?: string;
  expectedAnswers?: string[];
  expectedAnswerType?: "text" | "number" | "boolean";
  metaData?: {
    questionId: string;
    scenarios?: {
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      description: string | null;
      details: string | null;
      chatId: string | null;
      approximateTime: number | null;
      examResultId: string | null;
      chosenByCoachino?: boolean;
      chosenByUser?: boolean;
    }[];
  };
};

interface Props {
  m: Msg;
  i: number;
  onQuestionAnswered?: () => void;
  questions: ({
    scale: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      labels: string[];
      weights: number[];
    } | null;
    QuestionKey: {
      id: string;
      questionId: string;
      dimensionId: string;
      multiplier: number;
      perOptionWeights: number[];
      keyedOptionIndexes: number[];
    }[];
  } & {
    code: string | null;
    meta: JsonValue | null;
    id: string;
    question: string;
    examId: string;
    options: string[];
    type: QuestionType;
    isMandatory: boolean;
    scaleId: string | null;
    optionWeights: number[];
    anchorA: string | null;
    anchorB: string | null;
    createdAt: Date;
    updatedAt: Date;
  })[];
  userAnswers: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    questionId: string;
    answer: string;
  }[];
}
const ChatMessageCard = ({
  m,
  i,
  onQuestionAnswered,
  questions,
  userAnswers,
}: Props) => {
  if (m.type === "question") {
    return (
      <Card
        key={i}
        dir='rtl'
        className={`md:w-fit w-[80dvw] md:max-w-2/3 !p-2 ${
          m.role === "user" ? "ml-auto bg-primary/30 w-fit" : "mr-auto bg-glass"
        }`}
      >
        <CardContent className='flex flex-col gap-2 leading-8'>
          <ChatQuestionCard
            questionId={m.metaData?.questionId || ""}
            onAnswerSaved={onQuestionAnswered}
            question={
              questions?.find((q) => q.id === m.metaData?.questionId) || null
            }
            userAnswer={
              userAnswers?.find(
                (a) => a.questionId === m.metaData?.questionId,
              ) || null
            }
          />
        </CardContent>
      </Card>
    );
  }
  if (m.type === "scenario_recommendation") {
    return (
      <Card
        key={i}
        dir='rtl'
        className={`w-fit md:max-w-2/3 p-0 md:!p-2 ${
          m.role === "user" ? "ml-auto bg-primary/30 w-fit" : "mr-auto bg-glass"
        }`}
      >
        <CardContent className='flex flex-col gap-2 leading-8 md:p-2 p-0'>
          {m.metaData?.scenarios?.map?.((scenario) => (
            <ChatRecommendedScenarioCard
              key={scenario.id}
              recommendedScenario={{
                id: scenario.id,
                name: scenario.name,
                description: scenario.description,
                details: scenario.details,
                chatId: scenario.chatId,
                approximateTime: scenario.approximateTime,
                examResultId: scenario.examResultId,
                chosenByCoachino: scenario.chosenByCoachino,
                chosenByUser: scenario.chosenByUser || false,
                createdAt: scenario.createdAt || new Date(),
                updatedAt: scenario.updatedAt || new Date(),
                userId: scenario.userId,
              }}
            />
          ))}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      key={i}
      dir='rtl'
      className={`w-fit md:max-w-1/2 !p-2 ${
        m.role === "user" ? "ml-auto bg-primary/30 w-fit" : "mr-auto bg-glass"
      }`}
    >
      <CardContent className='flex flex-col gap-2 leading-8'>
        <Markdown remarkPlugins={[remarkGfm, remarkMath]}>{m.content}</Markdown>
        {m.type === "link" && m.url ? (
          <Link key={i} href={m.url} className=''>
            <Button variant={"accent"} className='p-6'>
              {m.text}
              <ChevronLeft className='ms-2 w-4 h-4' />
            </Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ChatMessageCard;
