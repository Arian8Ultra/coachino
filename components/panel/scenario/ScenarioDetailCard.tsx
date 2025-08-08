"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Scenario_GetByExamAndUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { Clock, ListTodo } from "lucide-react";
import Link from "next/link";
import TaskCard from "../task/TaskCard";

interface Props {
  scenario: Scenario_GetByExamAndUser;
  className?: string;
}
const ScenarioDetailCard = ({ scenario, className }: Props) => {
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
              <Link href={`/panel/scenarios/${scenario?.id}/chat`}>
                  <Button variant='accent' className=' ms-3'>
                    چت با کوچینو
                  </Button>
              </Link>
            </div>
          </div>
          <p className='text-sm text-muted-foreground'>
            {scenario?.description}
          </p>
          <p className='text text-muted-foreground leading-8'>
            {scenario?.details}
          </p>
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
            <TaskCard task={task} key={task.id} className='w-full flex-1/2' />
          ))}
      </div>
    </div>
  );
};

export default ScenarioDetailCard;
