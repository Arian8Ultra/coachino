/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionType } from "@/generated/prisma";
import { JsonValue } from "@/generated/prisma/runtime/library";
import { Scenario_GetByUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import ChatRecommendedScenarioCard from "../panel/scenario/ChatRecommendedScenarioCard";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import ChatMessageReplyCard from "./ChatMessageReplyCard";
import ChatQuestionCard from "./ChatQuestionCard";
import { Subscription_GetAll } from "@/prisma/functions/Subscription/SubFun";
import HomeSubCard from "../panel/subscription/HomeSubCard";

type Msg = {
  role: "user" | "assistant";
  content: string;
  type?:
    | "link"
    | "question"
    | "text"
    | "scenario_recommendation"
    | "web_search"
    | "subscription_prompt";
  url?: string;
  text?: string;
  expectedAnswers?: string[];
  expectedAnswerType?: "text" | "number" | "boolean";
  metaData?: {
    taskId?: string;
    questionId?: string;
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
  plans: Subscription_GetAll;
  userSenarios: Scenario_GetByUser;
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

/** Remove a possible JSON trailer at end of stream (e.g., {"status":"saved",...}) */
function stripJsonTrailer(text: string): string {
  if (!text) return text;
  // Find a JSON object at the very end of the string
  const trailerMatch = text.match(/\s*\{[\s\S]*\}\s*$/);
  if (!trailerMatch) return text;

  const trailer = trailerMatch[0];
  // Heuristic: treat it as a trailer only if it contains a "status" key
  // (so we don't nuke legitimate JSON content in the assistant message)
  if (/"status"\s*:/.test(trailer)) {
    return text.slice(0, text.length - trailer.length).trimEnd();
  }
  return text;
}

const ChatMessageCardStream = ({
  m,
  i,
  onQuestionAnswered,
  questions,
  userAnswers,
  userSenarios,
  plans,
}: Props) => {
  // Clean content for streaming cases where the server appends a JSON trailer
  const cleanContent = stripJsonTrailer(m.content ?? "");
  if (m.type === "question") {
    return (
      <Card
        key={i}
        dir='rtl'
        className={`md:w-fit w-[80dvw] md:max-w-2/3 p-2! ${
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
  if (m.metaData?.taskId && m.type === "text") {
    return (
      <Card
        key={i}
        dir='rtl'
        className={`w-fit md:max-w-2/3 p-2! ${
          m.role === "user" ? "ml-auto bg-primary/30 w-fit" : "mr-auto bg-glass"
        }`}
      >
        <CardContent className='flex flex-col gap-2 leading-8 wrap-break-word'>
          {m.role === "user" ? (
            <ChatMessageReplyCard taskId={m.metaData.taskId} />
          ) : null}

          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              a: (props) => (
                <Link
                  href={props.href || ""}
                  {...props}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-glass p-1 px-3 rounded-sm hover:underline'
                />
              ),
              h1: (props) => (
                <h1 {...props} className='md:text-2xl text-xl font-bold my-2' />
              ),
              h2: (props) => (
                <h2 {...props} className='md:text-xl text-lg font-bold my-2' />
              ),
              h3: (props) => (
                <h3
                  {...props}
                  className='md:text-lg text-base font-bold my-2'
                />
              ),
              strong: (props) => (
                <strong {...props} className='font-semibold' />
              ),
              em: (props) => <em {...props} className='italic' />,

              // keep code blocks simple; you can swap with a highlighter if needed
              code: ({ inline, className, children, ...props }: any) => {
                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <span className='overflow-x-auto rounded-md p-3 bg-black/10 my-2'>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </span>
                );
              },
            }}
          >
            {cleanContent}
          </Markdown>
        </CardContent>
      </Card>
    );
  }

  if (m.type === "scenario_recommendation") {
    return (
      <Card
        key={i}
        dir='rtl'
        className={`w-fit md:max-w-2/3 p-0 md:p-4! ${
          m.role === "user" ? "ml-auto bg-primary/30 w-fit" : "mr-auto bg-glass"
        }`}
      >
        <CardContent className='flex flex-col gap-2 leading-8 md:p-2 p-2'>
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              a: (props) => (
                <Link
                  href={props.href || ""}
                  {...props}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-glass p-1 px-3 rounded-sm hover:underline'
                />
              ),
              h1: (props) => (
                <h1 {...props} className='md:text-2xl text-xl font-bold my-2' />
              ),
              h2: (props) => (
                <h2 {...props} className='md:text-xl text-lg font-bold my-2' />
              ),
              h3: (props) => (
                <h3
                  {...props}
                  className='md:text-lg text-base font-bold my-2'
                />
              ),
              strong: (props) => (
                <strong {...props} className='font-semibold' />
              ),
              em: (props) => <em {...props} className='italic' />,

              // keep code blocks simple; you can swap with a highlighter if needed
              code: ({ inline, className, children, ...props }: any) => {
                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <span className='overflow-x-auto rounded-md p-3 bg-black/10 my-2'>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </span>
                );
              },
            }}
          >
            {cleanContent}
          </Markdown>
          {m.metaData?.scenarios?.map?.((scenario) =>
            userSenarios.find((s) => s.id === scenario.id) ? null : (
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
            ),
          )}
        </CardContent>
      </Card>
    );
  }

  if (m.type === "web_search") {
    return (
      <Card
        key={i}
        dir='rtl'
        className={`w-fit md:max-w-1/2 p-2! ${
          m.role === "user" ? "ml-auto bg-primary/30 w-fit" : "mr-auto bg-glass"
        }`}
        // live region helps screen readers during streaming updates
        aria-live={m.role === "assistant" ? "polite" : undefined}
      >
        <CardContent className='flex flex-col gap-2 leading-8 wrap-break-word'>
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              a: (props) => (
                <Link
                  href={props.href || ""}
                  {...props}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-glass p-1 px-3 rounded-sm hover:underline'
                />
              ),
              h1: (props) => (
                <h1 {...props} className='md:text-2xl text-xl font-bold my-2' />
              ),
              h2: (props) => (
                <h2 {...props} className='md:text-xl text-lg font-bold my-2' />
              ),
              h3: (props) => (
                <h3
                  {...props}
                  className='md:text-lg text-base font-bold my-2'
                />
              ),
              strong: (props) => (
                <strong {...props} className='font-semibold' />
              ),
              em: (props) => <em {...props} className='italic' />,

              // keep code blocks simple; you can swap with a highlighter if needed
              code: ({ inline, className, children, ...props }: any) => {
                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <span className='overflow-x-auto rounded-md p-3 bg-black/10 my-2'>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </span>
                );
              },
            }}
          >
            {cleanContent}
          </Markdown>
        </CardContent>
      </Card>
    );
  }

  if (m.type === "subscription_prompt") {
    return (
      <Card
        key={i}
        dir='rtl'
        className={`w-fit p-2! ${
          m.role === "user" ? "ml-auto bg-primary/30 w-fit" : "mr-auto bg-glass"
        }`}
        // live region helps screen readers during streaming updates
        aria-live={m.role === "assistant" ? "polite" : undefined}
      >
        <CardContent className='flex flex-col gap-2 leading-8 wrap-break-word'>
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              a: (props) => (
                <Link
                  href={props.href || ""}
                  {...props}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-glass p-1 px-3 rounded-sm hover:underline'
                />
              ),
              h1: (props) => (
                <h1 {...props} className='md:text-2xl text-xl font-bold my-2' />
              ),
              h2: (props) => (
                <h2 {...props} className='md:text-xl text-lg font-bold my-2' />
              ),
              h3: (props) => (
                <h3
                  {...props}
                  className='md:text-lg text-base font-bold my-2'
                />
              ),
              strong: (props) => (
                <strong {...props} className='font-semibold' />
              ),
              em: (props) => <em {...props} className='italic' />,

              // keep code blocks simple; you can swap with a highlighter if needed
              code: ({ inline, className, children, ...props }: any) => {
                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <span className='overflow-x-auto rounded-md p-3 bg-black/10 my-2'>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </span>
                );
              },
            }}
          >
            {cleanContent}
          </Markdown>

          {m.url ? (
            <Link key={i} href={m.url} className=''>
              <Button variant={"accent"} className='p-6'>
                {m.text}
                <ChevronLeft className='ms-2 w-4 h-4' />
              </Button>
            </Link>
          ) : null}
          <div className='flex gap-10 md:flex-row flex-col flex-wrap w-11/12 mx-auto justify-evenly'>
            {plans
              ?.filter((plan) => !plan.isFree)
              .map((plan) => (
                <HomeSubCard key={plan.id} subscription={plan} />
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  // Default: text or link
  return (
    <Card
      key={i}
      dir='rtl'
      className={`w-fit md:max-w-1/2 p-2! ${
        m.role === "user"
          ? "ml-auto bg-primary/30 w-fit whitespace-pre-line wrap-break-word"
          : "mr-auto bg-glass"
      }`}
      // live region helps screen readers during streaming updates
      aria-live={m.role === "assistant" ? "polite" : undefined}
    >
      <CardContent className='flex flex-col gap-2 leading-8 wrap-break-word'>
        <Markdown
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            a: (props) => (
              <Link
                href={props.href || ""}
                {...props}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-glass p-1 px-3 rounded-sm hover:underline'
              />
            ),
            h1: (props) => (
              <h1 {...props} className='md:text-2xl text-xl font-bold my-2' />
            ),
            h2: (props) => (
              <h2 {...props} className='md:text-xl text-lg font-bold my-2' />
            ),
            h3: (props) => (
              <h3 {...props} className='md:text-lg text-base font-bold my-2' />
            ),
            strong: (props) => <strong {...props} className='font-semibold' />,
            em: (props) => <em {...props} className='italic' />,

            // keep code blocks simple; you can swap with a highlighter if needed
            code: ({ inline, className, children, ...props }: any) => {
              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <span className='overflow-x-auto rounded-md p-3 bg-black/10 my-2'>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </span>
              );
            },
          }}
        >
          {cleanContent}
        </Markdown>

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

export default ChatMessageCardStream;
