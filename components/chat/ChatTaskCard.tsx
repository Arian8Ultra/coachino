"use client";
import { Task_GetById } from "@/prisma/functions/Tasks/TasksFun";
import React from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
interface Props {
  taskId: string;
  onX?: () => void;
}
const ChatTaskCard = ({ taskId, onX }: Props) => {
  const [task, setTask] = React.useState<Task_GetById>();
  const fetchTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}?taskId=${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      setTask(data);
    } else {
      console.error("Failed to fetch task");
    }
  };

  React.useEffect(() => {
    if (taskId) fetchTask(taskId);
  }, [taskId]);

  return task ?(
    <div className='bg-glass backdrop-blur-md p-4 rounded-full flex w-full justify-between items-center'>
      <p
        className={
          "text-base font-semibold whitespace-nowrap md:max-w-[35vh] max-w-[60dvw] overflow-hidden text-ellipsis" +
          (task?.status === "COMPLETED" ? " line-through text-green-600" : "")
        }
      >
        {task?.title}
      </p>
      <Button variant='outline' size='icon' onClick={onX}>
        <X className='w-4 h-4' />
      </Button>
    </div>
  ) : null;
};

export default ChatTaskCard;
