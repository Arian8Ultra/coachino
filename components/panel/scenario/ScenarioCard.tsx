"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";
import { Clock, MoveLeft, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
interface Props {
  scenario: Scenario_GetById;
}
const ScenarioCard = ({ scenario }: Props) => {
  const router = useRouter();
  if (!scenario) {
    return null;
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm(
      "آیا از حذف این سناریو مطمئن هستید؟ این عمل قابل بازگشت نیست.",
    );
    if (!confirmDelete) return;
    const deleteScenario = async (id: string) => {
      const res = await fetch("/api/scenario", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: id }),
      });
      if (res.ok) {
        toast.success("سناریو با موفقیت حذف شد");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(`خطا در حذف سناریو: ${errorData.error || "خطای ناشناخته"}`);
      }
    };
    toast.promise(deleteScenario(id), {
      loading: "در حال حذف سناریو...",
      success: "سناریو با موفقیت حذف شد",
      error: "خطا در حذف سناریو",
    });
  };
  return (
    <Card key={scenario.id} className={"bg-glass "}>
      <CardContent className='flex flex-col gap-2 h-full z-10'>
        <div className='flex flex-col gap-3'>
          <div className='flex justify-between items-center'>
            <div className='flex items-top justify-between gap-2'>
              <h2 className='font-semibold text-lg'>{scenario.name}</h2>
            </div>
            <Button
              variant='outline'
              size='icon'
              className='text-destructive hover:bg-destructive/10 border-destructive'
              onClick={() => handleDelete(scenario.id)}
            >
              <Trash className='w-4 h-4' />
            </Button>
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
