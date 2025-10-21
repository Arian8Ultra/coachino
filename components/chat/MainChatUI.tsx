/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";
import { ChevronLeft, Send } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { toast } from "sonner";
import TopTitle from "../layout/TopTitle/TopTitle";
import ChatRecommendedScenarioCard from "../panel/scenario/ChatRecommendedScenarioCard";
import { ScrollArea } from "../ui/scroll-area";
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

interface MainChatUIProps {
  chatId?: string; // Optional, if you want to pass an existing
  scenario?: Scenario_GetById; // Optional, if you want to pass an existing
}

export default function MainChatUI({ chatId, scenario }: MainChatUIProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [firstStarted, setFirstStarted] = useState(false);
  const [input, setInput] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [writting, setWriting] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Initialize chat
  useEffect(() => {
    async function initChat() {
      setWriting(true);
      const res = await fetch("/api/chat/main/new", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return;
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

  // Auto scroll to bottom on new messages
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/ai/recommends/messages", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          console.error("Failed to fetch recommendations");
          return;
        }
        const data = await res.json();
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    fetchRecommendations();
  }, []);


  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setWriting(true);
    const res = await fetch("/api/chat/main/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updated }),
    });
    if (!res.ok) {
      setWriting(false);
      return toast.error("خطا در ارسال پیام. لطفا دوباره تلاش کنید.");
    }
    const { messages: newMsgs } = (await res.json()) as { messages: Msg[] };
    setWriting(false);
    setMessages((prev) => [...prev, ...newMsgs]);
    setRecommendations([]);
    // router.refresh();
  };

  const onQuestionAnswered = async () => {
    const input = "بعدی";
    const userMsg: Msg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setWriting(true);
    const res = await fetch("/api/chat/main/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updated }),
    });
    if (!res.ok) {
      setWriting(false);
      return toast.error("خطا در ارسال پیام. لطفا دوباره تلاش کنید.");
    }
    const { messages: newMsgs } = (await res.json()) as { messages: Msg[] };
    setWriting(false);
    setMessages((prev) => [...prev, ...newMsgs]);
    setRecommendations([]);
    // router.refresh();
  };
  return (
    <div
      className='md:inset-0 flex flex-col gap-3 h-full relative min-h-[90dvh]'
      ref={scrollRef}
    >
      {firstStarted && messages.length <= 1 && !writting && (
        <motion.div
          className='absolute z-20 p-4 backdrop-blur-sm rounded-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full h-screen '
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className='absolute z-20 p-4 bg-glass backdrop-blur-md rounded-md  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center md:w-fit'
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <video
              src='/video/main-chat-intro.mp4'
              controls
              autoPlay
              onEnded={() => {
                setFirstStarted(false);
              }}
              className='w-full h-full rounded-sm max-h-[80vh]'
              width={2000}
              height={2000}
            />
          </motion.div>
        </motion.div>
      )}
      {/* if in the messages is a link type then put it in the top of the page */}
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
      {/* Chat messages */}
      <ScrollArea className='flex-1 p-4'>
        <div className='space-y-4 text-popover'>
          {messages.map((m, i) =>
            m.type === "question" ? (
              <Card
                key={i}
                dir='rtl'
                className={`w-fit md:max-w-2/3 !p-2 ${
                  m.role === "user"
                    ? "ml-auto bg-primary/30 w-fit"
                    : "mr-auto bg-glass"
                }`}
              >
                <CardContent className='flex flex-col gap-2 leading-8'>
                  <ChatQuestionCard
                    questionId={m.metaData?.questionId || ""}
                    onAnswerSaved={onQuestionAnswered}
                  />
                </CardContent>
              </Card>
            ) : m.type === "scenario_recommendation" ? (
              <Card
                key={i}
                dir='rtl'
                className={`w-fit md:max-w-2/3 !p-2 ${
                  m.role === "user"
                    ? "ml-auto bg-primary/30 w-fit"
                    : "mr-auto bg-glass"
                }`}
              >
                <CardContent className='flex flex-col gap-2 leading-8'>
                  {/* {JSON.stringify(m.metaData?.scenarios)} */}
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
            ) : (
              <Card
                key={i}
                dir='rtl'
                className={`w-fit md:max-w-1/2 !p-2 ${
                  m.role === "user"
                    ? "ml-auto bg-primary/30 w-fit"
                    : "mr-auto bg-glass"
                }`}
              >
                <CardContent className='flex flex-col gap-2 leading-8'>
                  <Markdown remarkPlugins={[remarkGfm, remarkMath]}>
                    {m.content}
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
            ),
          )}
          {writting && (
            <div className='mr-auto p-4 animate-pulse text-muted-foreground'>
              <p>کوچینو در حال فکر کردنه</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}

      <div
        className='sticky bottom-7 md:max-w-9/12 md:min-w-2/5 min-w-full mx-auto mt-auto flex flex-col max-w-3/4'
        ref={inputRef}
      >
        {recommendations.length > 0 && (
          <div className='flex flex-wrap gap-2 overflow-x-auto pb-2 px-2 mx-auto'>
            {recommendations.map((rec, index) => (
              <Button
                key={index}
                variant='outline'
                className={`flex-shrink-0 bg-glass font-normal text-sm hover:bg-accent/50 backdrop-blur-lg ${
                  index === 0 ? "ms-2" : ""
                } ${rec === input ? "bg-accent/10 text-accent" : ""}`}
                onClick={() => {
                  setInput(rec);
                  inputRef.current?.focus();
                }}
              >
                {rec}
              </Button>
            ))}
          </div>
        )}
        {messages?.[messages.length - 1]?.role === "assistant" &&
          messages?.[messages.length - 1]?.expectedAnswers && (
            <div className='flex flex-wrap gap-2 overflow-x-auto pb-2 px-2 mx-auto'>
              {messages[messages.length - 1].expectedAnswers?.map(
                (rec, index) => (
                  <Button
                    key={index}
                    variant='outline'
                    className={`flex-shrink-0 bg-glass font-normal text-sm hover:bg-accent/50 backdrop-blur-lg ${
                      index === 0 ? "ms-2" : ""
                    } ${rec === input ? "bg-accent/10 text-accent" : ""}`}
                    onClick={() => {
                      setInput(rec);
                      inputRef.current?.focus();
                    }}
                  >
                    {rec}
                  </Button>
                ),
              )}
            </div>
          )}

        <div
          className='p-2 flex space-x-2 items-center bg-glass backdrop-blur-lg rounded-full sticky bottom-7 md:w-9/12  md:mx-auto mt-auto'
          style={{
            backdropFilter: "blur(10px)",
          }}
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
