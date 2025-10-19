"use client";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import { RecommendedScenario } from "@/generated/prisma";
import { useEffect, useState } from "react";
import RecommendedScenarioCard from "./RecommendedScenarioCard";
import { toast } from "sonner";

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
      toast.dismiss("loading-scenarios");
    }
    toast.loading("در حال بارگذاری سناریوها...", {
      id: "loading-scenarios",
    });
    load();
  }, [examId, resultId]);

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
          <RecommendedScenarioCard recommendedScenario={s} key={s.id} />
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
