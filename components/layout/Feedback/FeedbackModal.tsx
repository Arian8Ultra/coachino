"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackType } from "@/generated/prisma";
import { MessageCircleHeart } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const FeedbackModal = () => {
  const router = useRouter();
  //   const { userId, message, url, type } = await request.json();
  const [input, setInput] = React.useState<{
    message: string;
    url: string;
    type: FeedbackType;
  }>({
    message: "",
    url: "",
    type: FeedbackType.GENERAL_COMMENT,
  });
  const handleSubmit = async () => {
    const sendFeedbackResponse = async () => {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.message,
          url: input.url,
          type: input.type,
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    };
    toast.promise(sendFeedbackResponse(), {
      loading: "در حال ارسال بازخورد...",
      success: "بازخورد با موفقیت ارسال شد!",
      error: "خطا در ارسال بازخورد.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className='w-fit justify-start'>
          <MessageCircleHeart className='w-5 h-5 me-2' />
          ارسال بازخورد
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg p-6'>
        <DialogHeader>
          <DialogTitle>ارسال بازخورد</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <Textarea
            className='w-full p-2 border rounded'
            placeholder='متن بازخورد خود را وارد کنید...'
            value={input.message}
            onChange={(e) => setInput({ ...input, message: e.target.value })}
          />
          <Input
            type='text'
            className='w-full p-2 border rounded'
            placeholder='آدرس صفحه (اختیاری)'
            value={input.url}
            onChange={(e) => setInput({ ...input, url: e.target.value })}
          />
          <Select
            value={input.type}
            onValueChange={(value) =>
              setInput({ ...input, type: value as FeedbackType })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='نوع بازخورد را انتخاب کنید' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FeedbackType.BUG_REPORT}>گزارش باگ</SelectItem>
              <SelectItem value={FeedbackType.FEATURE_REQUEST}>
                درخواست ویژگی
              </SelectItem>
              <SelectItem value={FeedbackType.GENERAL_COMMENT}>
                نظر کلی
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} className='self-end'>
            ارسال بازخورد
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
