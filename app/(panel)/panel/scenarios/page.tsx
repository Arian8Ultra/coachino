import { GetUserId } from "@/auth/AuthFunctions";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import ScenarioCard from "@/components/panel/scenario/ScenarioCard";
import { Scenario_GetByUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { cookies } from "next/headers";

export default async function Page() {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"سناریو ها"}
          iconName='circle-question-mark'
          h1='سناریو ها'
          className='mb-4'
        />
        <p className='text-red-500'>برای مشاهده سناریو ها وارد شوید.</p>
      </div>
    );
  }
  const userId = token ? GetUserId(token) : null;
  if (!userId) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"سناریو ها"}
          iconName='circle-question-mark'
          h1='دسترسی غیرمجاز'
          className='mb-4'
        />
        <p className='text-red-500'>شما به این بخش دسترسی ندارید.</p>
      </div>
    );
  }
  const scenarios = await Scenario_GetByUser(userId);
  if (!scenarios || scenarios.length === 0) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"سناریو ها"}
          iconName='circle-question-mark'
          h1='سناریو ها'
          className='mb-4'
        />
        <p className='text-gray-500'>شما هیچ سناریویی ندارید.</p>
      </div>
    );
  }

  // Check if scenarios belong to the user
  const userScenarios = scenarios.filter(
    (scenario) => scenario.userId === userId,
  );
  if (userScenarios.length === 0) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"سناریو ها"}
          iconName='circle-question-mark'
          h1='دسترسی غیرمجاز'
          className='mb-4'
        />
        <p className='text-red-500'>شما به این سناریوها دسترسی ندارید.</p>
      </div>
    );
  }
  return (
    <div className='flex flex-col gap-3'>
      <TopTitle
        title={"سناریو ها"}
        iconName='circle-question-mark'
        h1='سناریو ها'
        className='mb-4'
      />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {userScenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
