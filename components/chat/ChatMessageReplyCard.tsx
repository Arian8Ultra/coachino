"use client";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";
import { Task_GetById } from "@/prisma/functions/Tasks/TasksFun";
import React from "react";
import { VerticalLamp } from "../ui/lamp";
interface Props {
  taskId: string;
  scenarioId?: string;
}
const ChatMessageReplyCard = ({ taskId, scenarioId }: Props) => {
  const [task, setTask] = React.useState<Task_GetById>();
  const [scenario, setScenario] = React.useState<Scenario_GetById>();
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

  const fetchScenario = async (scenarioId: string) => {
    const res = await fetch(`/api/scenarios?scenarioId=${scenarioId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      setScenario(data);
    } else {
      console.error("Failed to fetch scenario");
    }
  };

  React.useEffect(() => {
    if (scenarioId) fetchScenario(scenarioId);
  }, [scenarioId]);

  React.useEffect(() => {
    if (taskId) fetchTask(taskId);
  }, [taskId]);

  const content = () => {
    if (task && scenario) {
      return `${task.title} - ${scenario.name}`;
    }
    if (task) {
      return task.title;
    }
    if (scenario) {
      return scenario.name;
    }
    return "";
  };

  return task ? (
    <div className='flex w-full justify-between items-center  border-b pb-2 relative'>
      {/* <Reply className='w-4 h-4 mr-2 text-muted-foreground' /> */}
      <VerticalLamp
        lampLightWidth='150px'
        color={"#4e78d6"}
        lampThickness='2.5px'
        className='gap-4 z-20 *:h-full! h-8 inline-block absolute -start-4 -translate-x-1/2 top-1/2 -translate-y-1/2'
      />
      <p
        className={
          "text-base whitespace-nowrap md:max-w-[35vh] max-w-[60dvw] overflow-hidden text-ellipsis text-muted-foreground" +
          (task?.status === "COMPLETED" ? " line-through text-green-600" : "")
        }
      >
        {content()}
      </p>
    </div>
  ) : null;
};

export default ChatMessageReplyCard;
