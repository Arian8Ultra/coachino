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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Exam_GetById } from "@/prisma/functions/Exam/ExamFun";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

interface Props {
  exam: Exam_GetById;
}
const ExamModal = ({ exam }: Props) => {
  const [input, setInput] = React.useState<{
    name: string;
    description: string;
    userPrompt?: string;
    systemPrompt?: string;
  }>({
    name: exam?.name || "",
    description: exam?.description || "",
    userPrompt: exam?.userPrompt || "",
    systemPrompt: exam?.systemPrompt || "",
  });
  const router = useRouter();
//   const [questions, setQuestions] = React.useState(exam?.Questions || []);
  if (!exam) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/exams", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: exam.id,
        ...input,
      }),
    });
    if (res.ok) {
      toast.success("آزمون با موفقیت به‌روزرسانی شد");
      router.refresh();
    } else {
      toast.error("خطا در به‌روزرسانی آزمون");
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm("آیا از حذف این آزمون مطمئن هستید؟")) return;
    const res = await fetch(`/api/admin/exams?id=${examId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: examId }),
    });
    if (res.ok) {
      toast.success("آزمون با موفقیت حذف شد");
      router.refresh();
    } else {
      toast.error("خطا در حذف آزمون");
    }
  };

  return (
    <Dialog>
      <DialogTrigger className='bg-glass p-1.5 rounded-lg hover:bg-glass/80'>
        <Edit className='cursor-pointer' />
      </DialogTrigger>
      <DialogContent className='rtl max-h-[80vh] overflow-y-auto sm:max-w-lg '>
        <DialogHeader className='sticky top-0 bg-glass backdrop-blur-md p-3 rounded-lg border'>
          <DialogTitle className='text-center'>{`ویرایش آزمون: ${exam.name}`}</DialogTitle>
        </DialogHeader>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='name'>نام آزمون</Label>
            <Input
              id='name'
              value={input.name}
              onChange={(e) => setInput({ ...input, name: e.target.value })}
              placeholder='نام آزمون'
              className='w-full'
              required
            />
          </div>
          <div className='flex flex-col gap-1 '>
            <Label htmlFor='description'>توضیحات آزمون</Label>
            <Textarea
              id='description'
              value={input.description}
              onChange={(e) =>
                setInput({ ...input, description: e.target.value })
              }
              placeholder='توضیحات آزمون'
              className='w-full'
              required
            />
          </div>
          <div className='flex flex-col gap-1 '>
            <Label htmlFor='userPrompt'>User Prompt</Label>
            <Textarea
              id='userPrompt'
              value={input.userPrompt}
              onChange={(e) =>
                setInput({ ...input, userPrompt: e.target.value })
              }
              placeholder='User Prompt'
              className='w-full'
              required
            />
          </div>
          <div className='flex flex-col gap-1 '>
            <Label htmlFor='systemPrompt'>System Prompt</Label>
            <Textarea
              id='systemPrompt'
              value={input.systemPrompt}
              onChange={(e) =>
                setInput({ ...input, systemPrompt: e.target.value })
              }
              placeholder='System Prompt'
              className='w-full'
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Button
              type='button'
              variant='destructive'
              className='w-full mt-4'
              onClick={() => handleDelete(exam.id)}
            >
              حذف آزمون
            </Button>
            <Button type='submit' className='w-full mt-4'>
              ذخیره تغییرات
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamModal;
