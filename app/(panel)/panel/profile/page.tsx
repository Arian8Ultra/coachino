import { IsAuthenticated } from "@/auth/AuthFunctions";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import SubMiniCard from "@/components/panel/subscription/SubMiniCard";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Scenario_GetByUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { Subscription_GetAll } from "@/prisma/functions/Subscription/SubFun";
import { Tast_GetUserTasks } from "@/prisma/functions/Tasks/TasksFun";
import { prisma } from "@/prisma/prisma";
import { AccordionItem } from "@radix-ui/react-accordion";
import { endOfMonth, startOfMonth } from "date-fns";

export default async function Page() {
  const user = await IsAuthenticated();
  if (!user) {
    return <div>لطفا وارد شوید تا بتوانید این صفحه را مشاهده کنید.</div>;
  }
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { params: true },
  });
  const userId = user.id;
  const scenarios = await Scenario_GetByUser(userId);
  const tasks = await Tast_GetUserTasks(userId);

  const doneTasks = tasks.filter((task) => task.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const totalScenarios = scenarios.length;
  const averageTime =
    scenarios.reduce((acc, scenario) => {
      return acc + (scenario.approximateTime || 0);
    }, 0) / totalScenarios || 0;

  const userSub = await prisma.userSubscription
    .findMany({
      where: {
        userId: userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subscription: true,
      },
    })
    .then((subs) => subs[0]);
  const plans = await Subscription_GetAll();
  const now = new Date();
  const monthlyLimit = userSub?.subscription.chatsPerMonth || 0;
  const userMonthChats = await prisma.message.count({
    where: {
      userId: user.id,
      role: "user",
      createdAt: {
        gte: startOfMonth(now),
        lt: endOfMonth(now),
      },
    },
  });
  const daysLeft = userSub
    ? Math.ceil(
        ((userSub.endDate?.getTime() || 0) - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const totalDays = userSub
    ? Math.ceil(
        ((userSub.endDate?.getTime() || 0) -
          (userSub.startDate?.getTime() || 0)) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  return (
    <div className='flex flex-col gap-5'>
      <TopTitle
        title='پروفایل من'
        iconName='user-round'
        containerClassName='mb-4'
        iconClassName='fill-primary stroke-0'
      />
      <div className='flex flex-col p-4 gap-5 bg-glass rounded-md border'>
        <h2 className='text-xl font-bold text-center'>اطلاعات شخصی</h2>
        <p>
          <strong>نام کاربری:</strong> {user?.name || "تنظیم نشده"}
        </p>
        <p>
          <strong>شماره همراه:</strong> {user?.phone || "تنظیم نشده"}
        </p>
        <p>
          <strong>تاریخ عضویت:</strong>{" "}
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString("fa-IR")
            : "تنظیم نشده"}
        </p>
      </div>
      <div className='flex flex-col p-4 gap-5 bg-glass rounded-md border'>
        <h2 className='text-xl font-bold text-center'>اطلاعات اشتراک</h2>
        {userSub ? (
          <>
            <div className='flex justify-evenly gap-5'>
              {!userSub.subscription.isFree ? (
                <SubMiniCard subscription={userSub.subscription} justShow />
              ) : (
                plans
                  ?.filter((plan) => plan.id !== userSub.subscription.id)
                  .map((plan) => <SubMiniCard key={plan.id} subscription={plan} />)
              )}
            </div>
            <Card className='bg-glass'>
              <CardContent className='flex flex-col gap-4'>
                <p>
                  چت های این ماه شما :
                  <span>
                    {userMonthChats} / {monthlyLimit}
                  </span>
                </p>
                <Progress
                  value={(userMonthChats / monthlyLimit) * 100}
                  className='w-full'
                />
              </CardContent>
            </Card>
            <Card className='bg-glass'>
              <CardContent className='flex flex-col gap-4'>
                <p>
                  زمان باقی مانده :<span>{daysLeft} روز</span>
                </p>
                <Progress
                  value={((totalDays - daysLeft) / totalDays) * 100 || 0}
                  className='w-full'
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <h3 className='text-2xl font-bold'>پلن‌های اشتراک کوچینو</h3>
            <div className='grid md:grid-cols-3 w-fit mx-auto gap-10'>
              {plans.map((plan) => (
                <SubMiniCard key={plan.id} subscription={plan} />
              ))}
            </div>
          </>
        )}
      </div>
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='profile' className='bg-glass rounded-md border'>
          <AccordionTrigger className='w-full p-4 text-right'>
            اطلاعات جمع آوری شده
          </AccordionTrigger>
          <AccordionContent>
            <div className='flex flex-col p-4 gap-5'>
              <p className='text-accent p-2 bg-accent/10 rounded-md'>
                تمامی اطلاعات شما رمزگذاری شده اند و تنها در دسترس شما میباشد
              </p>
              {userProfile?.params.length ? (
                userProfile.params.map((param) => (
                  <div
                    key={param.id}
                    className='border-b border-border/50 pb-2'
                  >
                    <p>
                      <strong>نام پارامتر:</strong> {param.key || "تنظیم نشده"}
                    </p>
                    <p>
                      <strong>مقدار پارامتر:</strong>{" "}
                      {param.value || "تنظیم نشده"}
                    </p>
                  </div>
                ))
              ) : (
                <p>هیچ اطلاعاتی یافت نشد.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Card className='bg-glass'>
        <CardContent className='flex flex-col gap-4'>
          <h2 className='text-lg font-semibold'>در یک نگاه</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
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
    </div>
  );
}
