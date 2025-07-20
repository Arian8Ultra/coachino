/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MODEL } from "@/generated/prisma";
import { Chat_GetById } from "@/prisma/functions/Chat/ChatFun";
import { useChat } from "@ai-sdk/react";
import { Copy, Paperclip, Send, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface Props {
  id?: string;
  userId: string;
  chatId?: string; // Optional, if you need to pass chatId for some reason
  model?: MODEL | null;
  token: string;
  chat: Chat_GetById | null; // Optional, if you need to pass chat data for some reason
}
const ChatCard = ({ id, userId, chatId, model, token, chat }: Props) => {
  const [loading, setLoading] = useState(false);
  const [dbMessages, setDbMessages] = useState<Chat_GetById | null>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
  } = useChat({
    body: {
      model: model,
    },
    headers: {
      token: token,
    },
  });

  const GetMessages = async () => {
    setLoading(true);
    try {
      if (!chat) {
        toast.error("Chat not found");
        return;
      }
      setMessages(
        chat.Messages.map((message) => ({
          id: message.id,
          content: message.content,
          role: message.role as "user" | "assistant",
          createdAt: message.createdAt,
        })),
      );
      setDbMessages(chat);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = async (
    content: string,
    role: "user" | "assistant",
    attachments?: FileList,
  ) => {
    const res = await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        role,
        chatId: id,
        attachments
      }),
    });
    if (!res.ok) {
      console.error("Failed to add message");
      toast.error("Failed to add message");
      return;
    }
  };

  const Files = () => {
    if (!files) return null;
    return Array.from(files).map((file, index) => (
      <div
        key={index}
        className='flex items-center gap-2 bg-sidebar-border/40 p-2 rounded-md'
      >
        <span className='text-primary'>{file.name}</span>
        <span className='text-xs text-muted-foreground'>
          {Math.round(file.size / 1024)} KB
        </span>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            const dt = new DataTransfer();
            Array.from(files).forEach((file, i) => {
              if (i !== index) dt.items.add(file);
            });
            const newFiles = dt.files;
            setFiles(newFiles.length > 0 ? newFiles : undefined);
            toast.success("File removed");
          }}
        >
          <Trash className='h-4 w-4' />
        </Button>
      </div>
    ));
  };

  useEffect(() => {
    if (chatId && userId && chat) {
      GetMessages();
    }
  }, [chatId, userId]);

  // when the assistant is done streaming, add the message to the chat
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const lastDbMessage = dbMessages?.Messages[dbMessages.Messages.length - 1];
    if (
      !lastDbMessage &&
      lastMessage?.role === "assistant" &&
      status === "ready"
    ) {
      handleAddMessage(lastMessage.content, "assistant");
    }
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      status === "ready" &&
      lastMessage.content.trim() !== "" &&
      lastDbMessage &&
      lastDbMessage.content !== lastMessage.content
    ) {
      handleAddMessage(lastMessage.content, "assistant");
    }
  }, [messages, status]);

  // scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop =
        containerRef.current.scrollHeight - containerRef.current.clientHeight;
    }
  }, [messages]);

  return (
    <>
      <div
        className='flex-1 p-2 w-full max-h-[80dvh] overflow-y-auto gap-3 flex flex-col'
        ref={containerRef}
      >
        {messages.map((message) => (
          <div key={message.id} className='whitespace-pre-wrap'>
            {message.role === "user" ? (
              <div className='flex flex-col p-2 rounded-md bg-sidebar-border w-fit place-self-end gap-2'>
                {/* <span className='text-primary font-semibold'>You</span> */}
                <span className='text-primary text-sm'>{message.content}</span>
                {/* a copy button */}
                <div className='flex p-2 rounded-md bg-background/20 w-fit gap-2'>
                  <Copy
                    className='h-4 w-4 cursor-pointer hover:text-primary'
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      toast.success("Message copied to clipboard");
                    }}
                  />
                </div>
              </div>
            ) : message.role === "assistant" ? (
              <div className='flex flex-col bg-accent/10 p-2 rounded-md w-fit relative'>
                {/* a copy button */}
                <span className='text-accent font-semibold'>Nexiino</span>
                <span className='text-primary text-sm p-2'>
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </Markdown>
                </span>
                <div className='flex p-2 rounded-md bg-accent/10 w-fit gap-2'>
                  <Copy
                    className='h-4 w-4 cursor-pointer hover:text-primary'
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      toast.success("Message copied to clipboard");
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {loading && (
          <div className='flex flex-col w-fit'>
            <span className='text-accent font-semibold'>
              <Skeleton className='h-10 w-full' />
            </span>
          </div>
        )}

        {status === "streaming" && (
          <div className='flex flex-col w-fit'>
            <span className='text-accent font-semibold'>
              Nexiino Thinking...
            </span>
          </div>
        )}
        {status === "error" && (
          <div className='flex flex-col w-fit'>
            <span className='text-red-500 font-semibold'>
              Error occurred. Please try again.
            </span>
          </div>
        )}
      </div>
      <div className='flex gap-2 flex-wrap w-full'>
        <Files />
      </div>
      <form
        className='flex gap-2 rounded-md md:w-2xl max-w-full w-full'
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() !== "") {
            handleSubmit(e, {
              experimental_attachments: files,
            });
            handleAddMessage(input, "user", files);
            setFiles(undefined);
          }
        }}
      >
        <Textarea
          value={input}
          placeholder='Say something...'
          onChange={handleInputChange}
          disabled={status === "streaming"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (input.trim() !== "") {
                handleSubmit(e, {
                  experimental_attachments: files,
                });                
                handleAddMessage(input, "user", files);
                setFiles(undefined);
              }
            }
          }}
          className='w-full max-w-2xl h-full min-h-[50px] resize-none !text-base'
        />
        {/* a input for files that will pass to the models */}
        <Button
          className='h-full aspect-square w-12'
          variant='default'
          type='button'
          onClick={() => {
            fileInputRef.current?.click();
            setFiles(undefined);
          }}
        >
          <input
            type='file'
            onChange={(event) => {
              if (event.target.files) {
                setFiles(event.target.files);
              }
            }}
            className='hidden'
            multiple
            ref={fileInputRef}
          />
          <Paperclip className='h-4 w-4' />
        </Button>
        <Button
          className='h-full aspect-square w-12'
          variant='default'
          type='submit'
          disabled={status === "streaming" || input.trim() === "" || loading}
        >
          <Send />
        </Button>
      </form>
    </>
  );
};

export default ChatCard;
