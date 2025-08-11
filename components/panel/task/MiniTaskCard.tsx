"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task_GetById } from "@/prisma/functions/Tasks/TasksFun";
import { CheckCircle, OctagonAlert, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  task: Task_GetById;
  className?: string;
}
const MiniTaskCard = ({ task, className }: Props) => {
  const router = useRouter();
  if (!task) {
    return null;
  }

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
    <Accordion type='single' collapsible className='flex-1/2 md:flex-1/4'>
      <AccordionItem
        value={task.id}
        className={cn(
          "w-full p-4 rounded-xl border-card-border border",
          task.status === "COMPLETED"
            ? "bg-green-50 dark:bg-green-500/10"
            : "bg-glass",
          className,
        )}
      >
        <AccordionTrigger className='flex items-center justify-between'>
          <div className='flex md:flex-row flex-col items-center justify-start gap-2 w-full'>
            <p
              className={
                "text-base font-semibold whitespace-nowrap max-w-[20vh] overflow-hidden text-ellipsis" +
                (task.status === "COMPLETED"
                  ? " line-through text-green-600"
                  : "")
              }
            >
              {task.title}
            </p>{" "}
            <Link
              href={`/panel/scenarios/${task.Scenario?.id}`}
              className='max-w-[20ch] text-xs overflow-hidden text-ellipsis whitespace-nowrap bg-accent/10 px-2 py-1 rounded-full text-accent'
            >
              {(task.Scenario?.name.length ?? 0) > 20
                ? task.Scenario?.name.slice(0, 20) + "..."
                : task.Scenario?.name}
            </Link>
            {/* {task.status === "COMPLETED" && (
              <div className=''>
                <CheckCircle className='w-4 h-4 text-green-500' />
              </div>
            )} */}
            <span className='text-xs text-muted-foreground ms-auto'>
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
          <div className='flex flex-col gap-3 border-t pt-3'>
            <p className='text-sm text-muted-foreground'>{task.description}</p>
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
                // Handle edit task
                console.log("Edit task", task.id);
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default MiniTaskCard;
