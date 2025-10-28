/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";
import { ChevronLeft, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import TopTitle from "../layout/TopTitle/TopTitle";
import VideoModal from "../layout/VideoModal/VideoModal";
import { ScrollArea } from "../ui/scroll-area";
import ChatMessageCard from "./ChatMessageCard";
import { JsonValue } from "@/generated/prisma/runtime/library";
import { QuestionType } from "@/generated/prisma";
import ChatMessageCardStream from "./ChatMessageCardStream";
import { useSearchParams } from "next/navigation";
import ChatTaskCard from "./ChatTaskCard";
import { useRouter } from "next/navigation";

type Msg = {
  role: "user" | "assistant";
  content: string;
  type?: "link" | "question" | "text" | "scenario_recommendation";
  url?: string;
  text?: string;
  expectedAnswers?: string[];
  expectedAnswerType?: "text" | "number" | "boolean";
  metaData?: {
    questionId?: string;
    taskId?: string;
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

interface MainChatUIProps {
  chatId?: string;
  scenario?: Scenario_GetById;
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

const API_URL = "/api/chat/main/stream"; // مسیر API شما

export default function MainChatUIStream({
  chatId,
  scenario,
  questions,
  userAnswers,
}: MainChatUIProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [firstStarted, setFirstStarted] = useState(false);
  const [input, setInput] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [writting, setWriting] = useState(false);
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const [metaData, setMetaData] = useState<Msg["metaData"]>();
  const [taskIdState, setTaskId] = useState<string | undefined>(
    taskId || undefined,
  );
  const router = useRouter();

  useEffect(() => {
    if (taskIdState) {
      setMetaData({
        questionId: undefined,
        scenarios: undefined,
        taskId: taskIdState,
      });
    }
  }, [taskIdState]);

  // init
  useEffect(() => {
    async function initChat() {
      setWriting(true);
      const res = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setWriting(false);
        return;
      }
      const data = await res.json();
      setWriting(false);
      setMessages(data.messages);
      if (!firstStarted) {
        if (data.messages.length <= 1) {
          setFirstStarted(true);
        }
      }
    }
    initChat();
  }, [chatId]);

  // auto scroll
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages, writting]);

  // --- استریم‌کننده‌ی پاسخ بک‌اند ---
  async function streamChat(updatedMsgs: Msg[]) {
    // 1) POST پیام‌ها
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMsgs }),
    });

    if (!res.ok || !res.body) {
      throw new Error("پاسخ معتبری از سرور دریافت نشد.");
    }

    // 2) یک پیام دستیار خالی اضافه می‌کنیم که حین استریم پر شود
    let assistantIndex = -1;
    setMessages((prev) => {
      const assistantMsg: Msg = {
        role: "assistant",
        content: "",
        type: "text",
      };
      const next: Msg[] = [...prev, assistantMsg];
      assistantIndex = next.length - 1;
      return next;
    });

    // 3) خواندن استریم
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      full += chunk;

      // آپدیت live متن دستیار
      setMessages((prev) => {
        const next = [...prev];
        if (assistantIndex >= 0 && next[assistantIndex]) {
          const current = next[assistantIndex] as Msg;
          next[assistantIndex] = {
            ...current,
            content: current.content + chunk,
          } as Msg;
        }
        return next;
      });
    }

    // 4) بعد از اتمام استریم (ذخیره در DB توسط سرور انجام شده)
    //    اگر سرور تریلر JSON می‌فرستد، اینجا می‌تونی parse کنی:
    // try {
    //   const trailer = full.match(/\{[\s\S]*\}\s*$/)?.[0];
    //   if (trailer) {
    //     const meta = JSON.parse(trailer);
    //     console.log("Saved meta:", meta);
    //     // همچنین می‌تونی trailer را از متن حذف کنی و پیام را تمیز کنی:
    //     const clean = full.replace(trailer, "").trimEnd();
    //     setMessages((prev) => {
    //       const next = [...prev];
    //       if (assistantIndex >= 0 && next[assistantIndex]) {
    //         next[assistantIndex] = { ...next[assistantIndex], content: clean };
    //       }
    //       return next;
    //     });
    //   }
    // } catch {}

    // 5) همگام‌سازی امن: یک GET بزن تا اگر بک‌اند پیام لینک/سناریو جدا ساخته، UI هم ببیند
    try {
      const syncRes = await fetch(API_URL, { method: "GET" });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setMessages(syncData.messages);
      }
    } catch {}
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setWriting(true);
    setTaskId(undefined);

    try {
      await streamChat(updated);
    } catch (e) {
      toast.error("خطا در ارسال پیام. لطفا دوباره تلاش کنید.");
    } finally {
      setWriting(false);
    }
  };

  const onQuestionAnswered = async () => {
    const input = "بعدی";
    const userMsg: Msg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setWriting(true);

    try {
      await streamChat(updated);
    } catch (e) {
      toast.error("خطا در ارسال پیام. لطفا دوباره تلاش کنید.");
    } finally {
      setWriting(false);
    }
  };

  return (
    <div
      className='md:inset-0 flex flex-col gap-3 h-full relative min-h-[90dvh]'
      ref={scrollRef}
    >
      {firstStarted && messages.length <= 1 && !writting && (
        <VideoModal
          src='/video/main-chat-intro.mp4'
          autoPlay
          onEnded={() => {
            setFirstStarted(false);
          }}
        />
      )}

      <TopTitle
        title='چت با کوچینو'
        h1='با کوچینو خود صحبت کنید'
        iconName='sparkles'
        sub='با کوچینو خود در مورد چیزی که نیازد دارید صحبت کنید'
        containerClassName='mb-4'
      />

      {messages.find((m) => m.type === "link")?.text?.includes("سناریو") &&
        !scenario && (
          <Link
            href={
              messages.find(
                (m) => m.type === "link" && m.text?.includes("سناریو"),
              )?.url || "#"
            }
            className='w-fit mx-auto mb-4 sticky top-10 z-10'
          >
            <Button variant='accent' className='w-fit p-6 backdrop-blur-2xl'>
              {messages.find(
                (m) => m.type === "link" && m.text?.includes("سناریو"),
              )?.text || "مشاهده سناریو"}
              <ChevronLeft className='ms-2 w-4 h-4' />
            </Button>
          </Link>
        )}

      <ScrollArea className='flex-1 p-4'>
        <div className='space-y-4 text-popover'>
          {messages.map((m, i) => (
            <ChatMessageCardStream
              key={i}
              m={m}
              i={i}
              onQuestionAnswered={onQuestionAnswered}
              questions={questions}
              userAnswers={userAnswers}
            />
          ))}
          {writting && (
            <div className='mr-auto p-4 animate-pulse text-muted-foreground'>
              <p>کوچینو در حال فکر کردنه</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div
        className='sticky bottom-7 md:max-w-9/12 md:min-w-2/5 min-w-full mx-auto mt-auto flex flex-col gap-2 max-w-3/4'
        ref={inputRef}
      >
        {taskId && (
          <ChatTaskCard
            taskId={taskIdState || ""}
            onX={() => {
              setTaskId(undefined);
              router.push("/panel");
            }}
          />
        )}
        <div
          className='p-2 flex space-x-2 items-center bg-glass backdrop-blur-lg rounded-full sticky bottom-7 md:w-9/12  md:mx-auto mt-auto'
          style={{ backdropFilter: "blur(10px)" }}
          ref={inputRef}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder='در مورد چی حرف بزنیم؟'
            className='flex-1 bg-glass p-3 rounded-full !h-full '
          />
          <Button
            variant={"accent"}
            size={"icon"}
            className='w-fit h-full aspect-square rounded-full'
            onClick={handleSend}
            disabled={!input.trim() || writting}
          >
            <Send className='w-6 h-6' />
          </Button>
        </div>
      </div>
    </div>
  );
}
