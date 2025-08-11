import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";
import { Clock, Eye } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  scenario: Scenario_GetById;
}
const DashScenarioCard = ({ scenario }: Props) => {
  if (!scenario) {
    return null;
  }
  return (
    <Card key={scenario.id} className='bg-glass'>
      <CardContent className='flex flex-col gap-2 h-full'>
        <div className='flex flex-col gap-3'>
          <div className='flex justify-between items-center'>
            <h2 className='font-semibold text-lg'>{scenario.name}</h2>
            <div className='flex gap-2 items-center'>
              <Clock className='w-4 h-4 text-muted-foreground' />
              <p className='text-xs'>
                {scenario.approximateTime
                  ? `${scenario.approximateTime} روز`
                  : "بدون زمان تخمینی"}
              </p>
            </div>
          </div>
          <p className='text-sm text-muted-foreground text-justify md:line-clamp-2 leading-6 overflow-ellipsis'>
            {scenario.description}
          </p>
          <Link
            href={`/panel/scenarios/${scenario.id}`}
          >
            <Button variant='glass' className='w-full p-5'>
              <Eye className='w-4 h-4 inline ms-1' />
              مشاهده جزئیات سناریو
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashScenarioCard;
