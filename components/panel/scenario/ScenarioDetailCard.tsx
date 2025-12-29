"use client";
import CalendarGantt from "@/components/chart/CalendarGantt";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Scenario_GetByExamAndUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { Clock, ListTodo } from "lucide-react";
import TaskCard from "../task/TaskCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Props {
  scenario: Scenario_GetByExamAndUser;
  className?: string;
}
const ScenarioDetailCard = ({ scenario, className }: Props) => {
  if (!scenario) {
    return null;
  }
  return (
    <div className={cn("flex flex-col", className)}>
      <Card className='bg-glass'>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex md:flex-row flex-col items-center justify-between gap-3 border-b pb-3'>
            <h2 className='text-lg font-semibold'>{scenario?.name}</h2>
            <div className='flex gap-2 items-center'>
              <div className='flex gap-2 items-center'>
                <Clock className='w-4 h-4 text-primary' />
                <span className='text-sm text-muted-foreground'>
                  {scenario?.approximateTime} روز
                </span>
              </div>
              {/* a vertical divider */}
              <div className='h-6 w-px bg-muted-foreground'></div>
              <div className='flex gap-2 items-center text-muted-foreground'>
                <ListTodo className='w-4 h-4 text-accent' />
                <span>{scenario?.Tasks.length} تسک</span>
              </div>
            </div>
          </div>
          <p className='text-sm text-muted-foreground'>
            {scenario?.description}
          </p>
          {/* <p className='text text-muted-foreground leading-8'>
            {scenario?.details}
          </p> */}
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='item-1'>
              <AccordionTrigger className='text-sm text-primary font-semibold'>
                مشاهده توضیحات سناریو
              </AccordionTrigger>
              <AccordionContent>
                {scenario.details ? (
                  <p className='text-justify leading-8 text-sm text-muted-foreground whitespace-pre-line'>
                    {scenario.details}
                  </p>
                ) : (
                  <span className='text-sm text-red-500'>
                    راهنمایی برای این سناریو موجود نیست
                  </span>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className='flex items-center gap-3 p-4 my-3 w-full border-b border-muted-foreground/30'>
        <ListTodo className='w-6 h-6' />
        <p className='text-lg font-semibold'>تسک ها</p>
      </div>

      {/* now a card for the tasks */}
      <div className='flex flex-wrap gap-4'>
        {(scenario?.Tasks.length ?? 0) > 0 &&
          scenario?.Tasks?.sort((a, b) => {
            return (
              (a.dueDate &&
                b.dueDate &&
                new Date(a.dueDate).getTime() -
                  new Date(b.dueDate).getTime()) ||
              0
            );
          }).map((task) => (
            <TaskCard
              task={task}
              key={task.id}
              className='w-full flex-1/2'
              id={`task-${task.id}`}
            />
          ))}
      </div>
      <CalendarGantt
        tasks={
          scenario?.Tasks.map((task) => ({
            id: task.id,
            title: task.title,
            start: task.startDate ? new Date(task.startDate) : new Date(),
            end: task.dueDate ? new Date(task.dueDate) : new Date(),
            color:
              task.priority == "HIGH"
                ? "#ef4444"
                : task.priority == "NORMAL"
                ? "#f59e0b"
                : "#10b981",
            data: {
              description: task.description,
              priority: task.priority,
              difficulty: task.difficulty,
            },
            progress:
              task.status === "IN_PROGRESS"
                ? 50
                : task.status === "COMPLETED"
                ? 100
                : 0,
          })) || []
        }
        showToday
        rangeEnd={new Date(new Date().setMonth(new Date().getMonth() + 1))}
        className='mt-6 bg-glass w-[85dvw] md:w-[70dvw] overflow-auto mx-auto'
      />
      {/* <FullCalendarGantt
        tasks={
          scenario?.Tasks.map((task) => ({
            id: task.id,
            title: task.title,
            start: task.startDate ? new Date(task.startDate) : new Date(),
            end: task.dueDate ? new Date(task.dueDate) : new Date(),
            color:
              task.priority == "HIGH"
                ? "#ef4444"
                : task.priority == "NORMAL"
                ? "#f59e0b"
                : "#10b981",
            data: {
              description: task.description,
              priority: task.priority,
              difficulty: task.difficulty,
            },
            progress:
              task.status === "IN_PROGRESS"
                ? 50
                : task.status === "COMPLETED"
                ? 100
                : 0,
          })) || []
        }
        showToday
        dayWidth={90}
        rtl
        rtlFlip
        locale='fa-IR'
        className='mt-6 bg-glass w-[85dvw] md:w-[70dvw] overflow-auto mx-auto'
      /> */}
    </div>
  );
};

export default ScenarioDetailCard;
