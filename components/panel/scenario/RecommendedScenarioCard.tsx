"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendedScenario, Scenario } from "@/generated/prisma";
import { Clock, Flag, MoveLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
interface Props {
  recommendedScenario: RecommendedScenario;
}
const RecommendedScenarioCard = ({ recommendedScenario }: Props) => {
  const router = useRouter();

  const handleChoose = async (id: string) => {
    toast.loading("در حال انتخاب سناریو...", {
      id: "choose-scenario",
    });
    const res = await fetch("/api/scenario/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recommendedId: id }),
    });
    if (res.ok) {
      toast.success("سناریو با موفقیت انتخاب شد", {
        id: "choose-scenario",
      });
      const data = (await res.json()) as Scenario;
      console.log("Scenario selected successfully", data);
      router.push(`/panel/scenarios/${data.id}`); // Use router to navigate
    }
  };
  return (
    <Card key={recommendedScenario.id} className={"bg-glass"}>
      <CardContent className='flex flex-col gap-2 h-full'>
        <div className='flex flex-col gap-3'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center justify-center gap-2'>
              {recommendedScenario.chosenByCoachino ? (
                <Flag className='w-6 h-6 fill-accent stroke-accent' />
              ) : (
                <Flag className='w-6 h-6 fill-primary stroke-primary' />
              )}
              <h2 className='font-semibold text-lg'>
                {recommendedScenario.name}
              </h2>
            </div>
            {recommendedScenario.chosenByCoachino && (
              <div className='flex gap-2 p-3 bg-gradient-to-tl from-primary to-accent text-white h-fit rounded-2xl text-sm items-center justify-center'>
                <Sparkles className='w-4 h-4 fill-white' />
                <span className='md:block hidden'>پیشنهاد کوچینو</span>
              </div>
            )}
          </div>
          <div className='flex md:flex-row flex-col justify-between items-center gap-4'>
            <p className='text-sm text-muted-foreground text-justify md:line-clamp-1 overflow-ellipsis'>
              {recommendedScenario.description}
            </p>
            <p className='text-xs text-muted-foreground'>
              <Clock className='w-4 h-4 inline me-2' />
              {recommendedScenario.approximateTime
                ? `حدوداً ${recommendedScenario.approximateTime} روز`
                : "بدون زمان تخمینی"}
            </p>
          </div>
        </div>
        <div className='border-t border-muted-foreground/30 rounded-full my-1' />

        <p className='text-justify leading-8'>
          {recommendedScenario.details ? (
            <span className='text-sm text-muted-foreground'>
              {recommendedScenario.details}
            </span>
          ) : (
            <span className='text-sm text-red-500'>
              راهنمایی برای این سناریو موجود نیست
            </span>
          )}
        </p>
        <div className='grid grid-cols-2 gap-8 mt-auto'>
          <div className=''></div>
          <Button
            variant='glass'
            className='w-full p-6'
            onClick={() => handleChoose(recommendedScenario.id)}
          >
            شروع مسیر
            <MoveLeft className='ms-2 w-4 h-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedScenarioCard;
