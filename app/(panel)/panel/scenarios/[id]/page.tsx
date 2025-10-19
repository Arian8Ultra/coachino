import { GetUserId } from "@/auth/AuthFunctions";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import ScenarioDetailCard from "@/components/panel/scenario/ScenarioDetailCard";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";
import { cookies } from "next/headers";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"سناریو"}
          iconName='goal'
          h1='سناریو'
          className='mb-4'
        />
        <p className='text-red-500'>برای مشاهده سناریوها وارد شوید.</p>
      </div>
    );
  }
  const userId = token ? GetUserId(token) : null;
  const scenario = await Scenario_GetById(id);
  if (!scenario) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"سناریو"}
          iconName='goal'
          h1='سناریو یافت نشد'
          className='mb-4'
        />
        <p className='text-red-500'>سناریو مورد نظر یافت نشد.</p>
      </div>
    );
  }

  // Check if the scenario belongs to the user
  if (scenario.userId !== userId) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"سناریو"}
          iconName='goal'
          h1='دسترسی غیرمجاز'
          className='mb-4'
        />
        <p className='text-red-500'>شما به این سناریو دسترسی ندارید.</p>
      </div>
    );
  }
  return (
    <div className='flex flex-col gap-3'>
      <TopTitle
        title={"سناریو"}
        iconName='goal'
        h1={scenario?.name || "سناریو"}
        className='mb-4'
      />
      <ScenarioDetailCard
        scenario={scenario}
        className='col-span-full'
      />
    </div>
  );
}
