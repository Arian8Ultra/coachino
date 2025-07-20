"use client";
import Bdiv from "@/components/layout/Bdiv";
import { Scenario_GetByExamAndUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";

interface Props {
  scenario?: Scenario_GetByExamAndUser;
  userId?: string;
  className?: string;
  examId: string;
  viewButton?: boolean; // Optional prop to control the view button
  getTasksButton?: boolean;
}
const ScenarioCard = ({
  scenario,
  className,
  examId,
  viewButton,
  getTasksButton,
}: Props) => {
  const [topic, setTopic] = React.useState<string>("");
  const router = useRouter();

  return (
    <div className={"flex flex-col" + (className ? ` ${className}` : "")}>
      {scenario ? (
        <div className='p-4 rounded-md bg-gradient-to-r from-blue-500/10 to-pink-600/20 border-pink-500 border-2'>
          <h2 className='text-2xl font-semibold mb-4 first-letter:text-4xl'>
            Scenario for Topic:{" "}
            <span className='text-blue-500 text-shadow-pink-500 first-letter:text-3xl'>
              {scenario.name || "General"}
            </span>
          </h2>
          <h3 className='text-lg font-semibold mb-3'>{scenario.name}</h3>

          <p className='text-white text-lg'>
            {scenario.description || "No description available"}
          </p>
          {viewButton && (
            <button
              onClick={() => {
                toast.success("Scenario loaded successfully!");
                router.push(`/panel/scenario/${scenario.id}`);
              }}
              className='mt-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600'
            >
              <Sparkles className='inline mr-2' />
              View Scenario and Tasks
            </button>
          )}
          {getTasksButton && !(scenario.Tasks.length > 0) && (
            <button
              onClick={async () => {
                toast.loading("Generating tasks...", {
                  id: "generating-tasks",
                });
                const res = await fetch(
                  `/api/user_tasks/generate?examId=${examId}&scenarioId=${scenario.id}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  },
                );
                if (!res.ok) {
                  const errorText = await res.text();
                  toast.error(`Error: ${errorText}`, {
                    id: "generating-tasks",
                  });
                  return;
                }
                const data = await res.json();
                console.log("Tasks generated:", data);
                toast.success("Tasks generated successfully!", {
                  id: "generating-tasks",
                });
                router.refresh(); // Refresh the page to show the new tasks
              }}
              className='mt-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600'
            >
              <Sparkles className='inline mr-2' />
              Get Tasks
            </button>
          )}
          {scenario.Tasks.length > 0 && (
            <div className='mt-4'>
              <h4 className='text-lg font-semibold mb-2'>Tasks:</h4>
              {/*   {
    id: 1,
    date: "Mar 15, 2024",
    title: "Project Kickoff",
    description:
      "Initial team meeting and project scope definition. Established key milestones and resource allocation.",
  }, */}
              <Timeline value={1}>
                {scenario.Tasks.map((task, i) => (
                  <TimelineItem
                    key={task.id}
                    step={i + 1}
                  >
                    <TimelineHeader>
                      <TimelineSeparator />
                      <TimelineDate>
                        {task.dueDate?.toLocaleDateString()}
                      </TimelineDate>
                      <TimelineTitle>{task.title}</TimelineTitle>
                      <TimelineIndicator />
                    </TimelineHeader>
                    <TimelineContent>{task.description}</TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </div>
          )}
        </div>
      ) : (
        <Bdiv
          className='rounded-md'
          innerClassName='rounded-md p-3 flex flex-col gap-3 item-center justify-center'
        >
          {/* input for getting what topic user needs with a fiendly message */}
          <p>
            Please enter the topic you want to discuss and I will create a
            scenario for you.
          </p>
          <input
            type='text'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder='Enter topic...'
            className='p-2 border rounded-md w-full mt-2'
          />
          <button
            onClick={async () => {
              toast.loading("Creating scenario...", {
                id: "creating-scenario",
              });
              // const examId = url.searchParams.get("examId");
              // const topic = url.searchParams.get("topic");
              const res = await fetch(
                "/api/scenario" +
                  `?examId=${examId}&topic=${encodeURIComponent(topic)}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              );
              if (!res.ok) {
                const errorText = await res.text();
                toast.error(`Error: ${errorText}`, {
                  id: "creating-scenario",
                });
                return;
              }
              const data = await res.json();
              console.log("Scenario created:", data);
              toast.success("Scenario created successfully!", {
                id: "creating-scenario",
              });
              setTopic(""); // Clear the input field
              router.refresh(); // Refresh the page to show the new scenario
            }}
            className='mt-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600'
          >
            <Sparkles className='inline mr-2' />
            Create Scenario
          </button>
        </Bdiv>
      )}
    </div>
  );
};

export default ScenarioCard;
