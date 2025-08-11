"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenerateNewTask } from "@/function/scenario/Scenario";
import { UserTask } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle,
  Clock,
  OctagonAlert,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  task: UserTask;
  className?: string;
}
const TaskCard = ({ task, className }: Props) => {
  const router = useRouter();
  const [edit, setEdit] = useState<{
    enabled: boolean;
    mode: "TIME" | "TASK";
    dueTime: Date;
    input: string;
    recommendations?: {
      input: string;
      task: GenerateNewTask;
    }[];
  }>({
    enabled: false,
    mode: "TASK",
    dueTime: task.dueDate,
    input: task.title,
  });

  const handleDone = async (taskId: string) => {
    toast.loading("در حال انجام تسک...", {
      id: "task-done",
    });
    const res = await fetch(`/api/tasks/${taskId}/done`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId }),
    });
    if (res.ok) {
      toast.success("تسک با موفقیت انجام شد", {
        id: "task-done",
      });
      const data = await res.json();
      console.log("Task done successfully", data);
      router.refresh(); // Refresh the page to reflect the changes
    } else {
      toast.error("خطا در انجام تسک", {
        id: "task-done",
      });
      router.refresh(); // Refresh the page to reflect the changes
    }
  };

  return (
    <Accordion type='single' collapsible className='flex-1/2 md:flex-1/3'>
      <AccordionItem
        value={task.id}
        className={cn(
          "w-full bg-glass p-4 rounded-xl border-card-border border",
          task.status === "COMPLETED"
            ? "bg-green-50 dark:bg-green-500/10"
            : "bg-glass",
          className,
        )}
      >
        <AccordionTrigger className='flex items-center justify-between'>
          <div className='flex md:flex-row flex-col items-center justify-between gap-2 w-full'>
            <p
              className={
                "text-lg font-semibold" +
                (task.status === "COMPLETED"
                  ? " line-through text-green-600"
                  : "")
              }
            >
              {task.title}
            </p>
            {task.status === "COMPLETED" && (
              <div className=''>
                <span className='bg bg-green-500/20 p-2 rounded-full text-green-600 text-xs md:flex hidden'>
                  تسک انجام شده
                </span>
              </div>
            )}
            <span className='text-xs text-muted-foreground'>
              <Calendar className='w-4 h-4 inline me-1' />
              {task.dueDate &&
                new Date(task.dueDate).toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className='flex flex-col gap-3'>
          {edit?.enabled ? (
            <>
              <div className='flex w-full justify-between items-center gap-4'>
                {/* <X
                  className='w-6 h-6 cursor-pointer text-red-500'
                  onClick={() =>
                    setEdit({
                      enabled: false,
                      mode: "TASK",
                      dueTime: new Date(),
                      input: "",
                    })
                  }
                /> */}
                <Button
                  variant='accentGlass'
                  className='p-5 w-fit'
                  onClick={() => {
                    setEdit({
                      ...edit,
                      enabled: false,
                      mode: "TASK",
                      dueTime: task.dueDate,
                      input: task.title,
                    });
                  }}
                >
                  <X className='w-4 h-4 inline me-1' />
                  بازگشت
                </Button>
              </div>
              <div className='flex flex-col gap-3 p-4'>
                {edit.recommendations?.map((rec, index) => (
                  <div
                    key={index}
                    className='flex flex-col gap-2 bg-glass border p-4 rounded-lg'
                  >
                    <p className='text-sm text-muted-foreground'>
                      پیشنهاد: {rec.input}
                    </p>
                    <p className='text-lg text-muted-foreground font-semibold'>
                      <span className='font-normal'>تسک پیشنهادی: </span>{" "}
                      {rec.task.title}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      <Clock className='w-4 h-4 inline me-1' />
                      {new Date(rec.task.dueDate).toLocaleDateString("fa-IR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </p>
                    <p className='text-sm text-muted-foreground text-justify leading-7'>
                      <span className='font-semibold'>توضیحات: </span>{" "}
                      {rec.task.description}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      سختی:{" "}
                      <span className='font-bold text-primary'>
                        {rec.task.difficulty ? rec.task.difficulty : "نامشخص"}
                      </span>
                      <span className='text-muted-foreground/70'>/5</span>
                      <Rocket className='w-4 h-4 inline ms-1 fill-accent text-accent' />
                    </p>
                    <Button
                      variant='glass'
                      className='w-fit ms-auto px-8 py-6'
                      onClick={async () => {
                        toast.loading("در حال ویرایش تسک...", {
                          id: "task-edit",
                        });
                        const res = await fetch(
                          `/api/tasks/${task.id}/edit/recommend/select`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              taskId: task.id,
                              newTask: rec.task,
                            }),
                          },
                        );
                        if (res.ok) {
                          toast.success("تسک با موفقیت ویرایش شد", {
                            id: "task-edit",
                          });
                          router.refresh();
                        } else {
                          toast.error("خطا در ویرایش تسک", {
                            id: "task-edit",
                          });
                        }
                      }}
                    >
                      انتخاب این پیشنهاد
                    </Button>
                  </div>
                ))}
                <p className='text-sm text-muted-foreground'>
                  چگونه تسک را ویرایش کنیم؟
                </p>
                <div className='flex w-full items-center gap-3'>
                  <Input
                    type='text'
                    placeholder=' وارد کنید...'
                    value={edit.input}
                    onChange={(e) =>
                      setEdit({ ...edit, input: e.target.value })
                    }
                    className='w-full flex-1'
                  />
                  <Button
                    variant='glass'
                    className='w-fit h-full p-3'
                    onClick={async () => {
                      if (!edit.input) {
                        toast.error("لطفاً ورودی را وارد کنید");
                        return;
                      }
                      toast.loading("در حال ویرایش تسک...", {
                        id: "task-edit",
                      });
                      const res = await fetch(
                        `/api/tasks/${task.id}/edit/recommend`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            userInput: edit.input,
                            taskId: task.id,
                          }),
                        },
                      );
                      if (res.ok) {
                        const data = (await res.json()) as GenerateNewTask;
                        setEdit({
                          ...edit,
                          recommendations: [
                            ...(edit.recommendations || []),
                            {
                              input: edit.input,
                              task: data,
                            },
                          ],
                        });
                        toast.success("تسک با موفقیت ویرایش شد", {
                          id: "task-edit",
                        });
                      } else {
                        toast.error("خطا در ویرایش تسک", {
                          id: "task-edit",
                        });
                      }
                    }}
                  >
                    <Sparkles className='w-4 h-4 inline' />
                    ویرایش تسک
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className='flex flex-col gap-3 border-t pt-3'>
                <p className='text-sm text-muted-foreground'>
                  {task.description}
                </p>
                <div className='flex justify-between w-full items-center gap-3'>
                  <p className='text-sm text-muted-foreground'>
                    <OctagonAlert className='w-4 h-4 inline me-1 text-accent' />
                    اولویت:{" "}
                    <span className='font-semibold'>
                      {task.priority == "LOW"
                        ? "پایین"
                        : task.priority == "NORMAL"
                        ? "متوسط"
                        : "بالا"}
                    </span>
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    سختی:{" "}
                    <span className='font-bold text-primary'>
                      {task.difficulty ? task.difficulty : "نامشخص"}
                    </span>
                    <span className='text-muted-foreground/70'>/5</span>
                    <Rocket className='w-4 h-4 inline ms-1 fill-accent text-accent' />
                  </p>
                </div>
              </div>
              <div className='flex justify-between items-center gap-3'>
                <p className='text-sm text-muted-foreground'>
                  وضعیت:{" "}
                  <span className='font-semibold'>
                    {task.status == "COMPLETED"
                      ? "انجام شده"
                      : task.status == "IN_PROGRESS"
                      ? "در حال انجام"
                      : "در انتظار"}
                  </span>
                </p>
                <p className='text-sm text-muted-foreground'>
                  {task.isDelayed ? (
                    <span className='text-red-500'>تأخیر دارد</span>
                  ) : (
                    <span className='text-green-500'>به موقع است</span>
                  )}
                </p>
              </div>
              {/* 2 buttons for editing task and making it done */}
              <div className='flex w-full gap-2 mt-4'>
                <Button
                  variant='outline'
                  className={
                    "p-5 flex-1/2" +
                    (task.status === "COMPLETED"
                      ? " hidden opacity-50 cursor-not-allowed"
                      : "")
                  }
                  onClick={() => {
                    setEdit({
                      enabled: true,
                      mode: "TIME",
                      dueTime: task.dueDate,
                      input: task.title,
                    });
                  }}
                  disabled={task.status === "COMPLETED"}
                >
                  ویرایش تسک
                </Button>
                <Button
                  variant='successGlass'
                  className='p-5 flex-1/2'
                  onClick={() => {
                    handleDone(task.id);
                  }}
                  disabled={task.status === "COMPLETED"}
                >
                  <CheckCircle className='w-4 h-4 inline me-1' />
                  {task.status === "COMPLETED" ? "تسک انجام شده" : "انجام تسک"}
                </Button>
              </div>
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TaskCard;
