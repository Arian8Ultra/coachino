"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import TopTitle from "../layout/TopTitle/TopTitle";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";

type Msg = {
  role: "user" | "assistant";
  content: string;
  type?: "link";
  url?: string;
  text?: string;
};

interface ChatUIProps {
  chatId?: string; // Optional, if you want to pass an existing
  scenario?: Scenario_GetById; // Optional, if you want to pass an existing
}

export default function ChatUIWithID({ chatId, scenario }: ChatUIProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [writting, setWriting] = useState(false);

  // Initialize chat
  useEffect(() => {
    async function initChat() {
      const res = await fetch("/api/chat/?chatId=" + chatId, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
    }
    initChat();
  }, [chatId]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;
    const userMsg: Msg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setWriting(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, messages: updated, examId: "" }),
    });
    if (!res.ok) return;
    const { messages: newMsgs } = (await res.json()) as { messages: Msg[] };
    setWriting(false);
    setMessages((prev) => [...prev, ...newMsgs]);
  };

  return (
    <div className='md:inset-0 flex flex-col gap-3 h-full relative'>
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
      {scenario && (
        <Link
          href={`/panel/scenarios/${scenario.id}`}
          className='w-fit mx-auto mb-4 sticky top-10 z-10'
        >
          <Button variant='accent' className='w-fit p-6 backdrop-blur-2xl'>
            مشاهده سناریو: {scenario.name}
            <ChevronLeft className='ms-2 w-4 h-4' />
          </Button>
        </Link>
      )}
      {/* Chat messages */}
      <ScrollArea className='flex-1 p-4 h-auto' ref={scrollRef}>
        <div className='space-y-4 text-popover'>
          {messages.map((m, i) => (
            <Card
              key={i}
              dir='rtl'
              className={`md:max-w-1/2  ${
                m.role === "user"
                  ? "ml-auto bg-primary text-accent-foreground w-fit"
                  : "mr-auto bg-glass"
              }`}
            >
              <CardContent className='flex flex-col gap-2 leading-8'>
                <Markdown remarkPlugins={[remarkGfm, remarkMath]}>
                  {m.content}
                </Markdown>
                {m.type === "link" && m.url ? (
                  <Link key={i} href={m.url} className=''>
                    <Button className='bg-primary text-accent-foreground p-6'>
                      {m.text}
                      <ChevronLeft className='ms-2 w-4 h-4' />
                    </Button>
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {writting && (
            <div className='mr-auto p-4 animate-pulse'>
              <p>در حال نوشتن پاسخ...</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div
        className='p-1 flex space-x-2 items-center bg-glass backdrop-blur-lg rounded-full sticky bottom-7 md:max-w-9/12 md:min-w-2/5 min-w-full mx-auto'
        style={{
          backdropFilter: "blur(10px)",
        }}
        ref={inputRef}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder='سوال خود را بپرسید...'
          className='flex-1 bg-glass p-4 rounded-full '
        />
        <Button
          variant={"accent"}
          className='w-fit h-full aspect-square rounded-full p-6'
          onClick={handleSend}
        >
          <Send className='w-5 h-5' />
        </Button>
      </div>
    </div>
  );
}
