"use client";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scenario } from "@/generated/prisma";
import { Flag, MoveLeft, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface RecommendedScenario {
  id: string;
  name: string;
  description: string;
  details?: string;
  approximateTime?: number;
  chosenByCoachino: boolean;
  chosenByUser: boolean;
}

interface Props {
  examId: string;
  resultId: string;
}

export default function ScenarioSelection({ examId, resultId }: Props) {
  const [scenarios, setScenarios] = useState<RecommendedScenario[]>([]);

  // fetch or generate
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/scenario/recommend?resultId=${resultId}`);
      let data = await res.json();
      if (data.length === 0) {
        // generate
        const gen = await fetch("/api/scenario/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examId, examResultId: resultId }),
        });
        data = await gen.json();
      }
      setScenarios(data);
    }
    load();
  }, [examId, resultId]);

  const handleChoose = async (id: string) => {
    const res = await fetch("/api/scenario/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recommendedId: id }),
    });
    if (res.ok) {
      const data = (await res.json()) as Scenario;
      // redirect or show success
      window.location.href = `/panel/scenarios/${data.id}`;
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <TopTitle
        title='انتخاب سناریو'
        iconName='grid-2-x-2'
        sub='سناریوهای پیشنهادی بر اساس آزمون و نتیجه شما'
        h1='سناریوهای پیشنهادی'
        className='mb-4'
      />

      <div className='grid md:grid-cols-2 gap-4'>
        {scenarios.map((s) => (
          <Card key={s.id} className={"bg-glass"}>
            <CardContent className='flex flex-col gap-2 h-full'>
              <div className='flex flex-col gap-3'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center justify-center gap-2'>
                    {s.chosenByCoachino ? (
                      <Flag className='w-6 h-6 fill-accent stroke-accent' />
                    ) : (
                      <Flag className='w-6 h-6 fill-primary stroke-primary' />
                    )}
                    <h2 className='font-semibold text-lg'>{s.name}</h2>
                  </div>
                  {s.chosenByCoachino && (
                    <div className='flex gap-2 p-3 bg-gradient-to-tl from-primary to-accent text-white h-fit rounded-2xl text-sm items-center justify-center'>
                      <Sparkles className='w-4 h-4 fill-white' />
                      پیشنهاد کوچینو
                    </div>
                  )}
                </div>
                <div className='flex justify-between items-center'>
                  <p className='text-sm text-muted-foreground line-clamp-1 overflow-ellipsis'>
                    {s.description}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {s.approximateTime
                      ? `حدوداً ${s.approximateTime} روز`
                      : "بدون زمان تخمینی"}
                  </p>
                </div>
              </div>
              <div className='border-t border-muted-foreground/30 rounded-full my-1' />

              <p className='text-justify leading-8'>
                {s.details ? (
                  <span className='text-sm text-muted-foreground'>
                    {s.details}
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
                  onClick={() => handleChoose(s.id)}
                >
                  شروع مسیر
                  <MoveLeft className='ms-2 w-4 h-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* <RadioGroup
        value={selected}
        onValueChange={setSelected}
        className='space-y-4'
      >
        {scenarios.map((s) => (
          <Card
            key={s.id}
            className={`${
              s.chosenByCoachino ? "border-2 border-blue-500" : ""
            }`}
          >
            <CardContent>
              <RadioGroupItem value={s.id} id={s.id} className='mr-2' />
              <label htmlFor={s.id} className='font-semibold'>
                {s.name}
              </label>
              <p className='mt-1 text-sm'>{s.description}</p>
              {s.approximateTime && (
                <p className='text-xs mt-2'>حدوداً {s.approximateTime} روز</p>
              )}
            </CardContent>
          </Card>
        ))}
      </RadioGroup> */}
      {/* 
      <Button onClick={handleChoose} disabled={!selected} className='mt-4'>
        انتخاب سناریو
      </Button> */}
    </div>
  );
}
