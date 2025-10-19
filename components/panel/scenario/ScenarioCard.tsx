"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";
import { Clock, MoveLeft } from "lucide-react";
import Link from "next/link";
interface Props {
  scenario: Scenario_GetById;
}
const ScenarioCard = ({ scenario }: Props) => {
  if (!scenario) {
    return null;
  }
  return (
    <Card key={scenario.id} className={"bg-glass "}>
      <CardContent className='flex flex-col gap-2 h-full'>
        <div className='flex flex-col gap-3'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center justify-center gap-2'>
              <h2 className='font-semibold text-lg'>{scenario.name}</h2>
            </div>
          </div>
          <div className='flex md:flex-row flex-col justify-between items-center gap-4'>
            <p className='text-sm text-muted-foreground text-justify md:line-clamp-1 overflow-ellipsis '>
              {scenario.description}
            </p>
            <p className='text-xs text-muted-foreground whitespace-nowrap'>
              <Clock className='w-4 h-4 inline me-2' />
              {scenario.approximateTime
                ? `${scenario.approximateTime} روز`
                : "بدون زمان تخمینی"}
            </p>
          </div>
        </div>
        <div className='border-t border-muted-foreground/30 rounded-full my-1' />

        <p className='text-justify leading-8'>
          {scenario.details ? (
            <span className='text-sm text-muted-foreground line-clamp-2 overflow-ellipsis'>
              {scenario.details}
            </span>
          ) : (
            <span className='text-sm text-red-500'>
              راهنمایی برای این سناریو موجود نیست
            </span>
          )}
        </p>
        <div className='flex gap-8 mt-auto'>
          <Link href={`/panel/scenarios/${scenario.id}`}>
            <Button variant='glass' className='w-full p-6'>
              مشاهده سناریو
              <MoveLeft className='ms-2 w-4 h-4' />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioCard;
