import { GetUserId } from "@/auth/AuthFunctions";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import DashScenarioSwiper from "@/components/panel/dashboard/DashScenarioSwiper";
import DashTaskSwiper from "@/components/panel/dashboard/DashTaskSwiper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { Scenario_GetByUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { Tast_GetUserTasks } from "@/prisma/functions/Tasks/TasksFun";
import { MoveLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
export default async function Page() {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"داشبورد"}
          iconName='layout-dashboard'
          h1='داشبورد'
          sub='در این بخش می‌توانید آمار کلی از وضعیت تسک ها و سناریوهای خود را مشاهده کنید.'
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
          title={"داشبورد"}
          iconName='layout-dashboard'
          h1='دسترسی غیرمجاز'
          sub='شما به این بخش دسترسی ندارید.'
          className='mb-4'
        />
        <p className='text-red-500'>شما به این بخش دسترسی ندارید.</p>
      </div>
    );
  }

  const scenarios = await Scenario_GetByUser(userId);
  const tasks = await Tast_GetUserTasks(userId);

  const doneTasks = tasks.filter((task) => task.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const totalScenarios = scenarios.length;
  const averageTime =
    scenarios.reduce((acc, scenario) => {
      return acc + (scenario.approximateTime || 0);
    }, 0) / totalScenarios || 0;

  return (
    <div className='flex flex-col gap-3'>
      <TopTitle
        // داشبورد
        title={"داشبورد"}
        iconName='layout-dashboard'
        h1='داشبورد'
        sub='در این بخش می‌توانید آمار کلی از وضعیت تسک ها و سناریوهای خود را مشاهده کنید.'
        className='mb-4'
      />
      <Card className='bg-glass'>
        <CardContent className='flex flex-col gap-4'>
          <h2 className='text-lg font-semibold'>در یک نگاه</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {/* use proggres */}
            <div className='flex flex-col items-center'>
              <h3 className='text-sm font-medium'>تعداد سناریوها</h3>
              <p>
                <span className='text-lg font-bold'>{totalScenarios}</span>
              </p>
            </div>
            <div className='flex flex-col items-center'>
              <h3 className='text-sm font-medium'>میانگین زمان سناریوها</h3>
              <p>
                <span className='text-lg font-bold'>{averageTime} روز</span>
              </p>
            </div>
            <div className='flex flex-col items-center'>
              <h3 className='text-sm font-medium'>تعداد تسک ها</h3>
              <p>
                <span className='text-lg font-bold'>{totalTasks}</span>
              </p>
            </div>

            <div className='flex flex-col items-center gap-5'>
              <h3 className='text-sm font-medium'>
                تسک های انجام شده:
                <span className=' ms-5 font-bold'>
                  <span className='text-primary'>{doneTasks}</span>/{" "}
                  {totalTasks}
                </span>
              </h3>
              <Progress
                value={(doneTasks / totalTasks) * 100}
                className='w-full'
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className='bg-glass mt-4 overflow-hidden'>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex w-full justify-between items-center'>
            <h2 className='text-lg font-semibold'>آمار سناریو ها</h2>
            <Link href='/panel/scenarios'>
              <Button variant='outline' className='text-xs'>
                مشاهده همه تسک ها
                <MoveLeft className='w-4 h-4 inline ms-1' />
              </Button>
            </Link>
          </div>
          <DashScenarioSwiper scenarios={scenarios} />
        </CardContent>
      </Card>
      <Card className='bg-glass mt-4'>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex w-full justify-between items-center'>
            <h2 className='text-lg font-semibold'>آمار تسک ها</h2>
            <Link href='/panel/tasks'>
              <Button variant='outline' className='text-xs'>
                مشاهده همه تسک ها
                <MoveLeft className='w-4 h-4 inline ms-1' />
              </Button>
            </Link>
          </div>
          <DashTaskSwiper tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  );
}
