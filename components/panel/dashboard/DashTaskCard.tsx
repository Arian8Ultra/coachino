import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Task_GetById } from "@/prisma/functions/Tasks/TasksFun";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

interface Props {
  task: Task_GetById;
}
const DashTaskCard = ({ task }: Props) => {
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
    <Card
      className={
        task.status === "COMPLETED"
          ? "bg-green-50 dark:bg-green-500/10"
          : "bg-glass"
      }
    >
      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-center justify-between gap-3 w-full'>
          <h2
            className={
              "text-base font-semibold whitespace-nowrap basis-2/3 overflow-hidden text-ellipsis" +
              (task.status === "COMPLETED"
                ? " line-through text-green-600"
                : "")
            }
          >
            {task.title}
          </h2>
          <p className='text-xs text-muted-foreground'>
            {new Date(task.dueDate).toLocaleDateString("fa-IR")}
          </p>
        </div>
        <Button
          variant={
            (task.status === "COMPLETED" ? "successGlass" : "glass")
          }
          className='p-5'
          onClick={() => {
            handleDone(task.id);
          }}
          disabled={task.status === "COMPLETED"}
        >
          <CheckCircle className='w-4 h-4 inline me-1' />
          {task.status === "COMPLETED" ? "تسک انجام شده" : "انجام تسک"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashTaskCard;
