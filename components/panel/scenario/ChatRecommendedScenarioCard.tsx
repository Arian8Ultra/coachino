"use client";
import VideoModal from "@/components/layout/VideoModal/VideoModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scenario } from "@/generated/prisma";
import { Clock, Flag, MoveLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
interface Props {
  recommendedScenario: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    description: string | null;
    details: string | null;
    chatId: string | null;
    approximateTime: number | null;
    examResultId: string | null;
    chosenByCoachino?: boolean;
    chosenByUser: boolean;
  };
}
const ChatRecommendedScenarioCard = ({ recommendedScenario }: Props) => {
  const router = useRouter();
  const [playing, setPlaying] = React.useState(false);

  const handleChoose = async (id: string) => {
    toast.loading("در حال انتخاب سناریو...", {
      id: "choose-scenario",
    });
    setPlaying(true);
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
    } else {
      const errorData = await res.json();
      if (res.status === 403) {
        toast.error(`خطا: محدودیت ماهانه سناریوها به پایان رسیده است.`, {
          id: "choose-scenario",
        });
        setPlaying(false);
        return;
      }
      toast.error(
        `خطا در انتخاب سناریو: ${errorData.error || "خطای ناشناخته"}`,
        {
          id: "choose-scenario",
        },
      );
    }
  };
  return (
    <>
      {playing && (
        <VideoModal
          src='/video/scenarioTasks.mp4'
          autoPlay
          onEnded={() => {
            setPlaying(false);
          }}
        />
      )}
      <Card
        key={recommendedScenario.id}
        className={"bg-primary/10 hover:bg-primary/20 transition-colors "}
      >
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
                <div className='flex gap-2 p-3 bg-linear-to-tl from-primary to-accent text-white h-fit rounded-2xl text-sm items-center justify-center'>
                  <Sparkles className='w-4 h-4 fill-white' />
                  <span className='md:block hidden'>پیشنهاد کوچینو</span>
                </div>
              )}
            </div>
            <div className='flex md:flex-row flex-col justify-between items-center gap-4'>
              <p className='text-sm text-muted-foreground text-justify md:line-clamp-1 overflow-ellipsis'>
                {recommendedScenario.description}
              </p>
              {/* <Accordion type='single' collapsible className='w-full'>
                <AccordionItem value='item-1'>
                  <AccordionTrigger className='text-sm text-muted-foreground text-justify md:line-clamp-1 overflow-ellipsis'>
                    {(recommendedScenario.description?.length ?? 0) > 30
                      ? recommendedScenario.description?.slice(0, 30) + "..."
                      : recommendedScenario.description || "بدون توضیحات"}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className='text-sm text-muted-foreground text-justify'>
                      {recommendedScenario.description || "بدون توضیحات"}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion> */}
              <p className='text-xs text-muted-foreground'>
                <Clock className='w-4 h-4 inline me-2' />
                {recommendedScenario.approximateTime
                  ? `حدوداً ${recommendedScenario.approximateTime} روز`
                  : "بدون زمان تخمینی"}
              </p>
            </div>
          </div>
          <div className='border-t border-muted-foreground/30 rounded-full my-1' />

          {/* <p className='text-justify leading-8'>
            {recommendedScenario.details ? (
              <span className='text-sm text-muted-foreground'>
                {recommendedScenario.details}
              </span>
            ) : (
              <span className='text-sm text-red-500'>
                راهنمایی برای این سناریو موجود نیست
              </span>
            )}
          </p> */}
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='item-1'>
              <AccordionTrigger className='text-sm text-primary font-semibold'>
                مشاهده توضیحات سناریو
              </AccordionTrigger>
              <AccordionContent>
                {recommendedScenario.details ? (
                  <p className='text-justify leading-8 text-sm text-muted-foreground whitespace-pre-line'>
                    {recommendedScenario.details}
                  </p>
                ) : (
                  <span className='text-sm text-red-500'>
                    راهنمایی برای این سناریو موجود نیست
                  </span>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className='grid md:grid-cols-2 gap-8 mt-auto'>
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
      {playing && (
        <VideoModal
          src='/video/scenarioTasks.mp4'
          autoPlay
          onEnded={() => {
            setPlaying(false);
          }}
        />
      )}
    </>
  );
};

export default ChatRecommendedScenarioCard;
